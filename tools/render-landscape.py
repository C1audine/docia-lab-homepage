"""Render the objective surface, its level sets and the projected descent iterates."""
from pathlib import Path
import json
import numpy as np
import contourpy
from PIL import Image, ImageDraw

OUTPUT = Path(__file__).resolve().parents[1] / "src" / "assets"
SCALE = 3
WIDTH, HEIGHT = 600, 420
bounds = (-1.55, 1.55, -1.4, 1.4)

def objective(x, y):
    radius = x*x + y*y
    peaks = (2.9*np.exp(-((x+.98)**2/.63 + (y-.18)**2/1.0)) +
             1.95*np.exp(-((x-.80)**2/.68 + (y-1.0)**2/.65)))
    return .13*x*x + .15*y*y + (1-np.exp(-1.05*radius))*peaks

def project(x, y, z):
    return 300 + 106*x + 77*y, 277 + 33*x - 46*y - 81*z

def points(xyz):
    return [tuple(np.rint(np.array(project(*p))*SCALE).astype(int)) for p in xyz]

def gradient(x, y):
    eps = 1.e-5
    return np.array([(objective(x+eps,y)-objective(x-eps,y))/(2*eps),
                     (objective(x,y+eps)-objective(x,y-eps))/(2*eps)])

im = Image.new("RGBA",(WIDTH*SCALE,HEIGHT*SCALE))
draw = ImageDraw.Draw(im)
xs = np.linspace(*bounds[:2],155)
ys = np.linspace(*bounds[2:],145)
X,Y = np.meshgrid(xs,ys)
Z = objective(X,Y)
PX,PY = project(X,Y,Z)
def screen(i,j):
    return (round(PX[j,i]*SCALE),round(PY[j,i]*SCALE))

# Slender exposed edges show the height of the surface above the plotting plane.
floor = -.23
for edge in [[(x,ys[0]) for x in xs],[(xs[-1],y) for y in ys]]:
    for k,((x,y),(xx,yy)) in enumerate(zip(edge,edge[1:])):
        top,ntop = objective(x,y),objective(xx,yy)
        side = [(x,y,top),(xx,yy,ntop),(xx,yy,floor),(x,y,floor)]
        draw.polygon(points(side), fill=(146,195,170,255) if x!=xx else (116,174,154,255))
        if k%2==0:
            draw.line(points([(x,y,top),(x,y,floor)]),fill=(77,134,117,255),width=1)
    draw.line(points([(*p,floor) for p in edge]),fill=(79,134,114,255),width=2)

# Render in camera depth order so the hills occlude lines on their far slopes.
gx,gy = np.gradient(Z,ys,xs)
illumination = np.clip((-.8*gy+.72*gx+.74)/np.sqrt(1+gy**2+gx**2),-.7,1.7)
t = np.clip((illumination+.7)/2.4*.92 + .08*Z/Z.max(),0,1)
dark = np.array([34,113,99]); light = np.array([230,244,214])
colors=(dark+(light-dark)*t[...,None]).astype(int)
cells = {}
levels=np.arange(.035,Z.max(),.056)
contours=contourpy.contour_generator(x=xs,y=ys,z=Z)
for ln,level in enumerate(levels):
    for line in contours.lines(level):
        for a,b in zip(line[:-1],line[1:]):
            center=(a+b)/2
            i=int(np.clip(np.searchsorted(xs,center[0])-1,0,len(xs)-2))
            j=int(np.clip(np.searchsorted(ys,center[1])-1,0,len(ys)-2))
            cells.setdefault((i,j),[]).append((points([(*a,level),(*b,level)]),ln))
order=sorted(((i,j) for i in range(len(xs)-1) for j in range(len(ys)-1)),key=lambda ij: xs[ij[0]]-ys[ij[1]])
for i,j in order:
    rgb=colors[j,i]
    draw.polygon([screen(i,j),screen(i+1,j),screen(i+1,j+1),screen(i,j+1)],fill=tuple(rgb)+(255,))
    if i%9==0:
        draw.line([screen(i,j),screen(i,j+1)],fill=tuple((rgb*.92).astype(int))+(255,),width=1)
    if j%9==0:
        draw.line([screen(i,j),screen(i+1,j)],fill=tuple((rgb*.92).astype(int))+(255,),width=1)
    for ends,ln in cells.get((i,j),[]):
        linecolor=tuple((rgb*(.64 if ln%5==0 else .76)).astype(int))+(255,)
        draw.line(ends, fill=linecolor,width=2 if ln%5==0 else 1)
im.resize((WIDTH*2,HEIGHT*2),Image.Resampling.LANCZOS).save(OUTPUT/'landscape.webp',lossless=True)

# A fixed gradient-descent step traces the actual surface. The first point lies
# on the inner face of the left hill; the global minimum is at the origin.
v=np.array([-.90,.70])
trajectory=[]
for k in range(220):
    z=float(objective(*v))
    sx,sy=project(*v,z)
    trajectory.append([round(sx,3),round(sy,3),round(z,9)])
    if np.linalg.norm(v)<1e-7: break
    v -= .047*gradient(*v)
assert np.linalg.norm(v)<1e-6 and all(a[2]+1e-8 >= b[2] for a,b in zip(trajectory,trajectory[1:]))
(OUTPUT/'descent.js').write_text('export const descent = '+json.dumps(trajectory,separators=(',',':'))+';\n')
print('Surface and descending path:',len(trajectory),'iterations;',trajectory[0],trajectory[-1])
