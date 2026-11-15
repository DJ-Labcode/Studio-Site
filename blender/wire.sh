# copy finished Blender clips into the website as scroll frames
S=/tmp/claude-0/-home-user-dj-pixel/f3ee8dfa-96e8-540a-bd49-96f13112dc04/scratchpad; B=$S/blend; P=$S/duoforge-web/public/frames
for c in "$@"; do
  rm -rf $P/$c; mkdir -p $P/$c
  for f in $B/clips/$c/dn/*.jpg; do ffmpeg -y -loglevel error -i $f -vf scale=1280:720:flags=lanczos -quality 78 $P/$c/$(basename ${f%.jpg}).webp; done
  [ "$c" = hero ] && cp $B/clips/hero/hero.mp4 $P/hero/hero.mp4
  echo "$c: $(ls $P/$c | wc -l) files, $(du -sh $P/$c | cut -f1)"
done
