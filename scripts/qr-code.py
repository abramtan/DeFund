import qrcode
from PIL import Image

# URL to encode in the QR code
url = "https://de-fund.vercel.app/"

# Generate QR code
qr = qrcode.QRCode(
    version=1,  # controls the size of the QR code (1 is the smallest)
    error_correction=qrcode.constants.ERROR_CORRECT_L,  # error correction level
    box_size=10,  # size of each box in the QR code grid
    border=4,  # border size
)
qr.add_data(url)
qr.make(fit=True)

# Create an image of the QR code
qr_image = qr.make_image(fill_color="white", back_color="black").convert("RGBA")

# Make the background transparent
data = qr_image.getdata()
new_data = []
for item in data:
    # Change black background pixels to transparent
    if item[0] == 0 and item[1] == 0 and item[2] == 0:
        new_data.append((0, 0, 0, 0))  # Transparent
    else:
        new_data.append(item)  # Keep original pixel

qr_image.putdata(new_data)

# Save the QR code image with transparency
qr_image.save("figures/website_qr_code_white_transparent.png", "PNG")

print("QR Code with white pattern and transparent background generated and saved as 'website_qr_code_white_transparent.png'.")