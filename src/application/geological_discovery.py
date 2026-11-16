"""Independent, bounded scientific source acquisition, never LLM URLs/code.

The NASA-hosted EID is a coarse historical catalog. Its point is a search region,
not a measured center. Only DEM validation can refine that location. No site IDs
or scientific metric values are embedded for new localities.
"""
import hashlib
import io
import json
import math
from pathlib import Path
import re
import time
import urllib.request

CATALOG_URL = 'https://ares.jsc.nasa.gov/engagement/activities/resources/rocks-soils-and-surfaces/earth-impact-database.pdf'
UNESCO_URL = 'https://whc.unesco.org/en/list/xml/'


def parse_dune_regions(content):
    import xml.etree.ElementTree as ET
    if b'<!DOCTYPE' in content.upper() or b'<!ENTITY' in content.upper(): raise ValueError('XML externo não permitido.')
    root=ET.fromstring(content);records=[]
    if not root.findall('.//row'):raise ValueError('Feed sem registros geográficos.')
    for row in root.findall('.//row'):
        name=row.findtext('site') or row.findtext('name_en') or ''
        if not re.search(r'\b(?:dunes?|sand sea|ergs?)\b',name,re.I):continue
        try:
            lat=float(row.findtext('latitude'));lon=float(row.findtext('longitude'));uid=row.findtext('id_number')
            if not uid or not uid.isdigit() or not (-90<=lat<=90 and -180<=lon<=180):continue
            records.append(dict(name=name,latitude=lat,longitude=lon,id=uid))
        except (ValueError,TypeError):continue
    return records


def discover_dunes(data,cache):
    """Official XML feed; reference points are not masks of sand or crests."""
    file=cache/'evidence'/'unesco.xml';failure=cache/'evidence'/'unesco-failure.json'
    file.parent.mkdir(parents=True,exist_ok=True)
    try:
        hit=file.is_file() and time.time()-file.stat().st_mtime<86400
        if hit:content=file.read_bytes()
        else:
            if failure.is_file() and time.time()-failure.stat().st_mtime<600:raise ValueError('Fonte em pausa após falha.')
            class NoRedirect(urllib.request.HTTPRedirectHandler):
                def redirect_request(self,*args,**kwargs):raise ValueError('Redirecionamento não autorizado.')
            with urllib.request.build_opener(NoRedirect()).open(UNESCO_URL,timeout=15) as response:content=response.read(8_000_001)
            if len(content)>8_000_000:raise ValueError('XML excede 8 MB.')
            parse_dune_regions(content)
            import uuid
            partial=file.with_suffix('.'+uuid.uuid4().hex+'.part')
            try:partial.write_bytes(content);partial.replace(file)
            finally:partial.unlink(missing_ok=True)
        def distance(r):
            rad=math.pi/180;dl=(r['latitude']-data['latitude'])*rad;dn=(r['longitude']-data['longitude'])*rad
            h=math.sin(dl/2)**2+math.cos(data['latitude']*rad)*math.cos(r['latitude']*rad)*math.sin(dn/2)**2
            return 6371008.8*2*math.asin(min(1,math.sqrt(h)))
        rows=[r for r in parse_dune_regions(content) if distance(r)<=data['raio_km']*1000]
        if len(rows)!=1:return None,'Fonte UNESCO consultada; nenhum ponto único de região de dunas dentro do raio solicitado.'
        r=rows[0];url='https://whc.unesco.org/en/list/'+r['id']+'/'
        source=dict(id='unesco-'+r['id'],title='UNESCO World Heritage: '+r['name'],url=url,catalog_url=UNESCO_URL,sha256=hashlib.sha256(content).hexdigest(),cache_hit=hit)
        return dict(id='unesco-'+r['id'],official_name=r['name'],kind='dune',status='source_verified',sources=[source],
            verified_location=dict(latitude=r['latitude'],longitude=r['longitude']),
            fields=dict(name=field(r['name'],None,url),kind=field('dune_region',None,url),latitude=field(r['latitude'],'deg',url),longitude=field(r['longitude'],'deg',url),
                **{k:field(None,'1' if k=='aridity_index' else 'deg' if k=='crest_azimuth' else 'crests/km2' if k=='dune_density' else 'm',url) for k in ['mean_height','height_p90','wavelength','crest_azimuth','dune_density','mean_spacing','aridity_index']}),
            message='Região de dunas documentada pela UNESCO: '+r['name']+'. O ponto cadastrado não delimita areia, cristas ou interdunas.',
            limitations=['O título do sítio documenta dunas/sand sea; o ponto de referência não é máscara de areia nem contorno de uma duna.',
                'Medições de cristas/interdunas e climatologia ainda exigidas; nenhum proxy geral é promovido a essas métricas.'],acquisition=[]),None
    except Exception:
        # Keep the original failure time: repeated reads must not extend cooldown.
        if not failure.is_file() or time.time()-failure.stat().st_mtime>=600:
            failure.write_text(json.dumps({'status':'unavailable','time':time.time()}),encoding='utf8')
        return None,'Fonte pública UNESCO indisponível nesta rede; não foi presumida descoberta de dunas.'


def parse_catalog(content):
    from pypdf import PdfReader
    records=[]
    reader=PdfReader(io.BytesIO(content))
    if len(reader.pages)>10: raise ValueError('Catálogo excede dez páginas.')
    for number,page in enumerate(reader.pages,1):
        for line in page.extract_text(extraction_mode='layout').splitlines():
            match=re.match(r'^\s*(.+?)\s{2,}(.+?)\s{2,}(\d{1,2}\.\d+)([NS])\s+(\d{1,3}\.\d+)([EW])\s+(.+?)\s{2,}(~?\d+(?:\.\d+)?)\s*$',line)
            if not match: continue
            name,place,lat,ns,lon,ew,age,diameter=match.groups()
            lat=float(lat)*(-1 if ns=='S' else 1);lon=float(lon)*(-1 if ew=='W' else 1)
            diameter=float(diameter.lstrip('~'))*1000
            if not (-90<=lat<=90 and -180<=lon<=180 and diameter>0):continue
            records.append(dict(name=name.strip(),location=place.strip(),latitude=lat,longitude=lon,diameter_m=diameter,page=number,raw=line.strip()))
    if len(records)<100:raise ValueError('Catálogo não passou na validação de estrutura.')
    return records


def catalog_bytes(cache):
    file=cache/'evidence'/'nasa-eid.pdf';file.parent.mkdir(parents=True,exist_ok=True)
    if file.is_file() and time.time()-file.stat().st_mtime<86400:
        return file.read_bytes(),True
    # Fixed independently configured source. Never follow redirects off NASA.
    class NoExternalRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self,req,fp,code,msg,headers,newurl):
            from urllib.parse import urlparse
            u=urlparse(newurl)
            if u.scheme!='https' or u.hostname!='ares.jsc.nasa.gov':raise ValueError('Redirecionamento de fonte não permitido.')
            return super().redirect_request(req,fp,code,msg,headers,newurl)
    request=urllib.request.Request(CATALOG_URL,headers={'User-Agent':'PlanetaryAnalogFinder/1.0 (scientific source verification)'})
    with urllib.request.build_opener(NoExternalRedirect()).open(request,timeout=20) as response:
        content=response.read(2_000_001)
    if len(content)>2_000_000 or not content.startswith(b'%PDF-'):raise ValueError('Fonte fora do contrato PDF/2 MB.')
    parse_catalog(content)  # Validate before atomically caching independent source.
    import uuid
    partial=file.with_suffix('.'+uuid.uuid4().hex+'.part')
    try:partial.write_bytes(content);partial.replace(file)
    finally:partial.unlink(missing_ok=True)
    return content,False


def field(value,unit,url=CATALOG_URL):
    return dict(value=value,unit=unit,source='UNESCO World Heritage' if url.startswith('https://whc.unesco.org/') else 'NASA ARES / Earth Impact Database (catálogo histórico)',url=url,evidence_type='published_catalog',verification='source_verified' if value is not None else 'insufficient_evidence')


def discover(data,cache,emit=lambda *_:None):
    emit('verificando_catalogo','Consultando catálogo de crateras NASA ARES, independentemente dos links do Gemini…')
    try:
        content,hit=catalog_bytes(cache);records=parse_catalog(content)
    except Exception:
        dune,note=discover_dunes(data,cache)
        if dune:return dune
        return dict(status='insufficient_evidence',kind=None,message='Catálogo geográfico independente indisponível ou inválido; alegações do Gemini não serão promovidas a evidências.',sources=[],limitations=['Não foi possível verificar a fonte independente nesta consulta.',note])
    lat,lon=data['latitude'],data['longitude']
    # Printed precision is 0.1 degree. Retain the rounding cell, not a false
    # high-precision point. Only intersecting cells can be measurement hypotheses.
    nearby=[r for r in records if abs(r['latitude']-lat)<=.05+data['raio_km']/111.2 and abs((r['longitude']-lon+180)%360-180)<=.05+data['raio_km']/(111.2*max(.05,math.cos(math.radians(lat))))]
    source=dict(id='nasa-eid',title='NASA ARES: Earth Impact Database (histórico, coordenadas arredondadas)',url=CATALOG_URL,sha256=hashlib.sha256(content).hexdigest(),cache_hit=hit,records_loaded=len(records))
    if len(nearby)!=1:
        dune,note=discover_dunes(data,cache) if not nearby else (None,'Catálogo de crateras ambíguo; não há seleção automática.')
        if dune:return dune
        return dict(status='insufficient_evidence',kind=None,message='Nenhuma feição única confirmada pelas fontes geográficas independentes para esta área.',sources=[source],limitations=['Catálogo não é exaustivo nem atualizado em tempo real; ausência não prova inexistência.',f'Candidatos geográficos de crateras encontrados: {len(nearby)}.',note])
    r=nearby[0]
    source['page']=r['page']
    extent=[r['longitude']-.05,r['latitude']-.05,r['longitude']+.05,r['latitude']+.05]
    entity='eid-'+re.sub(r'[^a-z0-9]+','-',r['name'].lower()).strip('-')+f"-{r['latitude']:.1f}-{r['longitude']:.1f}"
    return dict(id=entity,official_name=r['name'],kind='crater',status='source_verified',
        seed=[lat,lon], reference_diameter_m=r['diameter_m'],source_point=[r['latitude'],r['longitude']],coordinate_cell=extent,
        message=f"Cratera documentada no catálogo NASA ARES: {r['name']}. Coordenadas publicadas têm precisão de 0,1°; o ponto solicitado é apenas hipótese de busca no DEM.",
        fields=dict(name=field(r['name'],None),kind=field('impact_crater',None),latitude=field(r['latitude'],'deg'),longitude=field(r['longitude'],'deg'),diameter=field(r['diameter_m'],'m'),depth=field(None,'m'),rim=field(None,'m'),dune_height=field(None,'m'),dune_spacing=field(None,'m')),
        source_excerpt=r['raw'],sources=[source],
        limitations=['Coordenadas históricas arredondadas em 0,1° (~5,6 km por eixo). Região de busca não é delimitação.',
            'O centro solicitado inicia a busca; um contorno só é aceito com validação independente no DEM. Associação ao catálogo ainda requer revisão humana.',
            'Crateras grandes, soterradas, erodidas ou não circulares podem não ser suportadas pelo extrator radial.'],acquisition=[])
