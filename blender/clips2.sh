cd /tmp/claude-0/-home-user-dj-pixel/f3ee8dfa-96e8-540a-bd49-96f13112dc04/scratchpad/blend
for c in hero push pull; do
  [ -f clips/$c/$c.mp4 ] && continue
  blender -b -P build.py -- /tmp/claude-0/-home-user-dj-pixel/f3ee8dfa-96e8-540a-bd49-96f13112dc04/scratchpad/blend/clips/$c /tmp/claude-0/-home-user-dj-pixel/f3ee8dfa-96e8-540a-bd49-96f13112dc04/scratchpad/blend/clips/$c all 32 67 >> clips/$c/render.log 2>&1
  mkdir -p clips/$c/dn
  for f in clips/$c/frames/*.jpg; do [ -f clips/$c/dn/$(basename $f) ] || python3 denoise.py $f clips/$c/dn/$(basename $f) >/dev/null; done
  ffmpeg -y -loglevel error -framerate 24 -i clips/$c/dn/%04d.jpg -vf "scale=1280:720:flags=lanczos" -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -movflags +faststart clips/$c/$c.mp4
  echo "CLIP_$c" >> clips_status.txt
done
echo ALL_DONE >> clips_status.txt
