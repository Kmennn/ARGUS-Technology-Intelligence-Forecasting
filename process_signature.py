from PIL import Image

img_path = r"d:\(ACTIF)\public\assets\signature.png"
out_path = r"d:\(ACTIF)\public\assets\signature-transparent.png"
try:
    img = Image.open(img_path).convert("RGBA")
    data = img.getdata()
    new_data = []
    
    for item in data:
        r, g, b, a = item
        lum = int(0.299 * r + 0.587 * g + 0.114 * b)
        
        # Aggressively strip anything that is light grey or white
        if lum < 200:
            # Scale alpha so that darker pixels are more opaque
            alpha_val = int(((200 - lum) / 200) * 255)
            # Ensure the ink is very dark grey
            new_data.append((47, 42, 38, alpha_val))
        else:
            new_data.append((255, 255, 255, 0))

    img.putdata(new_data)
    img.save(out_path, "PNG")
    print("Perfect transparency applied")
except Exception as e:
    print(e)
