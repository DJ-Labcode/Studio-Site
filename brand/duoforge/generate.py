# Regenerates every DuoForge logo SVG in this folder: python3 generate.py
import os
OUT=os.path.dirname(os.path.abspath(__file__))
INK="#0B0B0F"; PAPER="#F5F3EE"; EMBER="#FF5A1F"; EMBER2="#FFB020"


def blk(c0,c1,r0,r1): return [(c,r) for c in range(c0,c1+1) for r in range(r0,r1+1)]
# 18 x 16 grid (sparks occupy rows 0-1), stroke = 2 cells
D=blk(0,1,2,15)+blk(2,5,2,3)+blk(2,5,14,15)+blk(6,7,4,5)+blk(6,7,12,13)
F=blk(8,9,2,15)+blk(10,15,2,3)+blk(10,13,8,9)
SP=blk(16,17,0,1); SP2=[(15,5)]
GW,GH=18,16
def rects(cells,ox,oy,s,fill):
    return "".join(f'<rect x="{ox+c*s:g}" y="{oy+r*s:g}" width="{s:g}" height="{s:g}" fill="{fill}"/>' for c,r in cells)
def icon(ox,oy,s,dcol,fcol,scol):
    g=rects(D,ox,oy,s,dcol)+rects(F,ox,oy,s,fcol)+rects(SP,ox,oy,s,scol)+rects(SP2,ox,oy,s,scol)
    return f'<g shape-rendering="crispEdges">{g}</g>'

G={
"D":["11110","10001","10001","10001","10001","10001","11110"],
"U":["10001"]*6+["01110"],
"O":["01110"]+["10001"]*5+["01110"],
"F":["11111","10000","10000","11110","10000","10000","10000"],
"R":["11110","10001","10001","11110","10100","10010","10001"],
"G":["01111","10000","10000","10111","10001","10001","01111"],
"E":["11111","10000","10000","11110","10000","10000","11111"],
}
def word(text,ox,oy,s,cols):
    out=[];x=ox
    for i,ch in enumerate(text):
        cells=[(c,r) for r,row in enumerate(G[ch]) for c,v in enumerate(row) if v=="1"]
        out.append(rects(cells,x,oy,s,cols[i])); x+=6*s
    return f'<g shape-rendering="crispEdges">{"".join(out)}</g>', x-ox-s

def svg(w,h,body,bg=None):
    b=f'<rect width="{w}" height="{h}" fill="{bg}"/>' if bg else ""
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">{b}{body}</svg>\n'
def save(name,s): open(os.path.join(OUT,name),"w").write(s)


# icon only
s=20; P=40
for name,bg,d in [("duoforge-icon.svg",None,PAPER),("duoforge-icon-dark.svg",INK,PAPER),("duoforge-icon-light.svg",PAPER,INK)]:
    W=GW*s+2*P; H=GH*s+2*P; M=max(W,H)
    save(name,svg(M,M,icon((M-GW*s)/2,(M-GH*s)/2,s,d,EMBER,EMBER2),bg))
W=512; s=18
save("duoforge-app-icon.svg",svg(W,W,f'<rect width="512" height="512" rx="112" fill="{INK}"/>'+icon((W-GW*s)/2,(W-GH*s)/2,s,PAPER,EMBER,EMBER2)))

def lockup(dcol,bg,fname):
    s=8; P=40
    ic=icon(0,0,s,dcol,EMBER,EMBER2)
    ws=s*1.6  # word cap height = 7*ws ~ 0.7 * icon body (14s)
    wy=2*s+(14*s-7*ws)/2
    wg,ww=word("DUOFORGE",GW*s+3*s,wy,ws,[dcol]*3+[EMBER]*5)
    W=GW*s+3*s+ww; H=GH*s
    save(fname,svg(W+2*P,H+2*P,f'<g transform="translate({P},{P})">{ic}{wg}</g>',bg))
lockup(PAPER,None,"duoforge-logo.svg")
lockup(PAPER,INK,"duoforge-logo-dark.svg")
lockup(INK,PAPER,"duoforge-logo-light.svg")

def stacked(dcol,bg,fname):
    ws=10; wg,ww=word("DUOFORGE",0,0,ws,[dcol]*3+[EMBER]*5)
    s=14; P=56; gap=40
    W=max(ww,GW*s)+2*P; H=P+GH*s+gap+7*ws+P
    body=icon((W-GW*s)/2,P,s,dcol,EMBER,EMBER2)+f'<g transform="translate({(W-ww)/2:g},{P+GH*s+gap})">{wg}</g>'
    save(fname,svg(W,H,body,bg))
stacked(PAPER,INK,"duoforge-logo-stacked-dark.svg")
stacked(INK,PAPER,"duoforge-logo-stacked-light.svg")
