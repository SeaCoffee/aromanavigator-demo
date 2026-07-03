import io

from django.core.files.base import ContentFile
from PIL import Image, ImageDraw, ImageFont


def normalize_image_and_save(image_file) -> ContentFile:
    image_file.open()
    image = Image.open(image_file).convert("RGB")

    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=95)
    buffer.seek(0)
    return ContentFile(buffer.read())


def add_watermark_and_save(image_file, text: str = "aromanavigator.com.ua") -> ContentFile:
    image_file.open()
    image = Image.open(image_file)

    if image.mode != "RGBA":
        image = image.convert("RGBA")

    text_layer = Image.new("RGBA", image.size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(text_layer)

    try:
        font = ImageFont.truetype("arial.ttf", size=max(18, image.width // 15))
    except OSError:
        font = ImageFont.load_default()

    bbox = draw.textbbox((0, 0), text, font=font)
    x_step = bbox[2] - bbox[0] + 100
    y_step = bbox[3] - bbox[1] + 100

    for y in range(0, image.height, y_step):
        for x in range(0, image.width, x_step):
            draw.text((x, y), text, font=font, fill=(255, 255, 255, 100))

    watermarked = Image.alpha_composite(image, text_layer).convert("RGB")
    buffer = io.BytesIO()
    watermarked.save(buffer, format="JPEG", quality=95)
    buffer.seek(0)
    return ContentFile(buffer.read())
