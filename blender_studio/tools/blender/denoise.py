import sys, numpy as np, oidn
from PIL import Image
dev = oidn.NewDevice(oidn.DEVICE_TYPE_DEFAULT); oidn.CommitDevice(dev)
def run(src, dst, albedo=None, normal=None):
    img = np.asarray(Image.open(src).convert('RGB'), dtype=np.float32) / 255.0
    h, w, _ = img.shape
    out = np.zeros_like(img)
    f = oidn.NewFilter(dev, 'RT')
    oidn.SetSharedFilterImage(f, 'color', img, oidn.FORMAT_FLOAT3, w, h)
    if albedo is not None: oidn.SetSharedFilterImage(f, 'albedo', albedo, oidn.FORMAT_FLOAT3, w, h)
    if normal is not None: oidn.SetSharedFilterImage(f, 'normal', normal, oidn.FORMAT_FLOAT3, w, h)
    oidn.SetSharedFilterImage(f, 'output', out, oidn.FORMAT_FLOAT3, w, h)
    try: oidn.RawFunctions.oidnSetFilterBool(f, b'srgb', True)
    except Exception as e: pass
    oidn.CommitFilter(f); oidn.ExecuteFilter(f)
    err = oidn.GetDeviceError(dev)
    oidn.ReleaseFilter(f)
    Image.fromarray((np.clip(out, 0, 1) * 255 + 0.5).astype(np.uint8)).save(dst, quality=95)
    return err
if __name__ == '__main__':
    print(run(sys.argv[1], sys.argv[2]))
