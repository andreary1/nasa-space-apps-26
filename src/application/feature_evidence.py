"""Geographic evidence and measured crater rims; never infer geology from a name.

Search boxes identify documented sites, not surveyed feature footprints. Metrics
come exclusively from the DEM. No catalog metric or score is copied.
"""
import math


def identify(data):
    lat, lon = data["latitude"], data["longitude"]
    # Study-area extent stated by Herzog et al. (2019), NOT a sand mask.
    if 31+4/60 <= lat <= 31+14/60 and -(4+2/60) <= lon <= -(3+56/60):
        return dict(id="erg_chebbi", status="documented_region", kind="dune",
            message="Campo de dunas documentado: Erg Chebbi. A caixa da área de estudo não delimita cristas nem exclui afloramentos/planícies; métricas de dunas ainda ausentes.",
            sources=[dict(id="erg-study", title="Herzog et al. (2019), área de estudo e levantamento laser/GNSS de Erg Chebbi", url="https://meetingorganizer.copernicus.org/EGU2019/EGU2019-6950.pdf"),
                dict(id="erg-nasa", title="NASA Earth Observatory: Sandy Sculptures in Morocco’s Erg Chebbi", url="https://science.nasa.gov/earth/earth-observatory/sandy-sculptures-in-moroccos-erg-chebbi-153562/")],
            limitations=["A resolução de 30 m resolve parte das megadunas, mas não comprova segmentação de cristas/interdunas.",
                "Azimute único é ambíguo em dunas estrela; P/ET0 exige climatologia, não é medido pelo DEM.",
                "Levantamento laser/GNSS publicado com resolução de 10 cm cobre uma duna; não é um DEM público automaticamente disponível para toda a ROI."],
            acquisition=[dict(title="Levantamento de alta resolução e métodos", url="https://meetingorganizer.copernicus.org/EGU2019/EGU2019-6950.pdf"),
                dict(title="Estudo de Lala Lallia (2024), dados/métodos e disponibilidade", url="https://doi.org/10.1038/s41598-024-53485-3")])
    # Rounded LPI coordinates locate the impact site, not its rim or exact center.
    distance = math.hypot((lat-(35+2/60))*111200, (lon+(111+1/60))*111200*math.cos(math.radians(lat)))
    if distance <= 1200:
        return dict(id="barringer", status="documented_site", kind="crater",
            message="Cratera de impacto documentada pelo LPI; procurando a borda no DEM.",
            seed=[35.027, -111.022], reference_diameter_m=1186,
            sources=[dict(id="barringer-lpi", title="LPI: Barringer, localização arredondada e diâmetro de referência (prior de busca)", url="https://www.lpi.usra.edu/science/kring/epo_web/impact_cratering/World_Craters_web/northamericacraters/Barringer.html")],
            limitations=["Centro inicial do catálogo local; ajustado à borda altimétrica, nunca ao nome digitado.",
                "Morfometria exploratória em DSM de 30 m; não substitui levantamento de campo. Incerteza horizontal de pelo menos um pixel."],
            acquisition=[dict(title="NCALM/OpenTopography: levantamento LiDAR Meteor Crater (EPSG:26912)", url="https://catalog.data.gov/dataset/meteor-crater-az")])
    return dict(status="unidentified", kind=None,
        message="Não foi possível identificar limites da feição. DEM válido mede relevo; origem de impacto/eólica exige evidência adicional.", sources=[], limitations=[])


def measure_crater(data, dem, affine, crs, topography, identification):
    """72 radial rim maxima, circle fit, interior and wall/outer annuli.

    Search uses a published diameter only as a prior (0.65–1.35 R). The measured
    polygon, profiles, fitted center and method are returned for inspection.
    Sampling finer than the grid is not claimed as improved resolution.
    """
    import numpy as np
    from scipy.ndimage import map_coordinates
    from rasterio.warp import transform
    res = topography["resolution_m"]
    measurement_resolution = max([res]+[i.get('resolution_native_approx_m',res) for i in topography['source'].get('inputs',[])])
    prior = identification["reference_diameter_m"]/2
    source = topography["source"]["title"] + "; radial_dem_v1"
    def blocked(reason):
        return None, dict(boundary_status="unavailable", message="Cratera documentada; não foi possível validar a delimitação: " + reason)
    if prior*2 < measurement_resolution*10:
        return blocked("menos de dez pixels no diâmetro.")
    sx, sy = transform("EPSG:4326", crs, [identification["seed"][1]], [identification["seed"][0]])
    center = np.array([sx[0],sy[0]])
    theta = np.arange(72)*2*np.pi/72
    distances = np.arange(prior*.65, prior*1.35+res*.25, res*.5)
    def sample(x,y):
        cols = (x-affine.c)/res-.5
        rows = (affine.f-y)/res-.5
        return map_coordinates(dem.astype(float), [rows,cols], order=1, mode="constant", cval=np.nan)
    for _ in range(4):
        xx = center[0]+np.cos(theta)[:,None]*distances
        yy = center[1]+np.sin(theta)[:,None]*distances
        profiles = sample(xx,yy)
        if not np.isfinite(profiles).all():
            return blocked("NoData ou área fora do DEM na busca radial.")
        peak = np.argmax(profiles,axis=1)
        if np.count_nonzero((peak==0)|(peak==len(distances)-1)) > 7:
            return blocked("mais de 10% dos máximos atingem os limites da janela de busca.")
        radii = distances[peak]
        points = np.column_stack((np.cos(theta)*radii,np.sin(theta)*radii))
        fit = np.linalg.lstsq(np.column_stack((2*points,np.ones(72))),np.sum(points**2,axis=1),rcond=None)[0]
        shift=fit[:2]
        if np.linalg.norm(shift) > prior*.35:
            return blocked("ajuste do centro instável.")
        if np.linalg.norm(shift) < res*.1:
            break
        center += shift
    # Re-evaluate profiles at the final fitted center; retain actual measured rim.
    xx=center[0]+np.cos(theta)[:,None]*distances
    yy=center[1]+np.sin(theta)[:,None]*distances
    profiles=sample(xx,yy)
    if not np.isfinite(profiles).all(): return blocked("NoData na borda final.")
    peak=np.argmax(profiles,axis=1)
    if np.count_nonzero((peak==0)|(peak==len(distances)-1)) > 7:
        return blocked("borda final intercepta a janela de busca.")
    radii=distances[peak]; rim=profiles[np.arange(72),peak]
    radius=float(np.mean(radii))
    cv=float(np.std(radii)/radius)
    if cv > .15:
        return blocked("dispersão radial superior a 15%; revisar centro/contorno.")
    ringx=center[0]+np.cos(theta)*radii; ringy=center[1]+np.sin(theta)*radii
    yygrid,xxgrid=np.indices(dem.shape)
    gx=affine.c+(xxgrid+.5)*res-center[0]; gy=affine.f-(yygrid+.5)*res-center[1]
    rr=np.hypot(gx,gy)
    inside=dem[rr<radius*.6]; inside=inside[np.isfinite(inside)]
    dy,dx=np.gradient(dem.astype(float),res)
    slope=np.degrees(np.arctan(np.hypot(dx,dy)))
    wall=slope[(rr>=radius*.6)&(rr<=radius*.95)]
    # No implicit filling of missing wall/floor measurements.
    if len(inside)<100 or len(wall)<100 or not np.isfinite(wall).all():
        return blocked("piso/parede insuficientes ou com NoData.")
    outerd=np.linspace(radius*1.5,radius*2,6)
    outer=sample(center[0]+np.cos(theta)[:,None]*outerd,center[1]+np.sin(theta)[:,None]*outerd)
    if not np.isfinite(outer).all(): return blocked("NoData no entorno de 1,5–2 raios.")
    # All sampled feature and surrounding points must lie in requested circular ROI.
    qx,qy=transform("EPSG:4326",crs,[data["longitude"]],[data["latitude"]])
    required_radius = math.hypot(center[0]-qx[0],center[1]-qy[0])+radius*2
    if required_radius > data["raio_km"]*1000:
        result, diagnosis = blocked(f"ROI não contém a cratera e seu entorno de 2 raios (necessários {required_radius/1000:.3f} km a partir do centro informado). Aumente o raio.")
        diagnosis["suggested_input"] = {**data, "raio_km": min(10, math.ceil(required_radius/1000*2)/2)}
        return result, diagnosis
    floor=float(np.percentile(inside,5)); border=float(np.median(rim))
    depth=border-floor; height=float(np.median(rim-np.median(outer,axis=1)))
    if depth<=0 or height<=0: return blocked("borda não se eleva sobre piso/entorno.")
    px=ringx-center[0]; py=ringy-center[1]
    polygon_area=float(abs(np.sum(px*np.roll(py,-1)-py*np.roll(px,-1)))/2)
    perimeter=float(np.sum(np.hypot(np.roll(px,-1)-px,np.roll(py,-1)-py)))
    values=dict(diameter_m=2*radius, depth_m=depth,depth_diameter_ratio=depth/(2*radius),
        rim_height_m=height,rim_height_diameter_ratio=height/(2*radius),rim_variation_m=float(np.std(rim)),
        rim_radius_cv=cv,mean_wall_slope=float(np.mean(wall)),wall_slope_p90=float(np.percentile(wall,90)),
        circularity=min(1.,4*np.pi*polygon_area/perimeter**2),rim_coherence=float(np.mean((rim>floor)&(rim>np.median(outer,axis=1)))))
    lons,lats=transform(crs,"EPSG:4326",ringx.tolist(),ringy.tolist())
    ring=list(map(list,zip(lons,lats)));ring.append(ring[0])
    clon,clat=transform(crs,"EPSG:4326",[center[0]],[center[1]])
    return dict(id="barringer-dem",kind="crater",reviewed=False,
        validation=dict(passed=True,method="radial_dem_v1",radials=72,radius_cv=cv),
        source=source,method="radial_dem_v1: 72 máximos radiais; centro ajustado por mínimos quadrados; piso P5 em r<0,6R; parede 0,6–0,95R; entorno 1,5–2R; circularidade do polígono observado. Diâmetro publicado é apenas prior de busca.",
        measurement_resolution_m=measurement_resolution,extent_m=float(max(np.ptp(ringx),np.ptp(ringy))),
        center=dict(latitude=clat[0],longitude=clon[0]),geometry=dict(type="Polygon",coordinates=[ring]),
        measurements={k:dict(value=v,unit="deg" if "slope" in k else "m" if k.endswith("_m") else "1",source=source) for k,v in values.items()},
        diagnostics=dict(rim_radii_m=radii.tolist(),rim_elevations_m=rim.tolist(),floor_p5_m=floor,
            wall_pixels=len(wall),floor_pixels=len(inside),horizontal_uncertainty_at_least_m=measurement_resolution,
            radius_search_m=[float(distances[0]),float(distances[-1])])), dict(boundary_status="measured",message="Cratera de impacto documentada; borda delimitada no DEM, 72 perfis e onze métricas calculados. Medição automática experimental, ainda sem revisão humana.")
