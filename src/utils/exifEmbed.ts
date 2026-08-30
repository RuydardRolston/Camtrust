import piexif from "piexifjs";

/**
 * Converts a decimal GPS coordinate into the [degrees, minutes, seconds]
 * rational format that the EXIF standard requires.
 */
function toExifGPS(decimal: number): [[number, number], [number, number], [number, number]] {
  const abs = Math.abs(decimal);
  const deg = Math.floor(abs);
  const minFloat = (abs - deg) * 60;
  const min = Math.floor(minFloat);
  const sec = Math.round((minFloat - min) * 60 * 100);
  return [
    [deg, 1],
    [min, 1],
    [sec, 100],
  ];
}

/**
 * Embeds capture timestamp and GPS coordinates as real EXIF metadata
 * into a base64 JPEG (data URL) before it is uploaded as site evidence.
 *
 * @param base64Jpeg - a data URL string, e.g. "data:image/jpeg;base64,...."
 * @param lat - latitude in decimal degrees
 * @param lng - longitude in decimal degrees
 * @param date - EXIF-formatted datetime string, e.g. "2026:08:29 14:35:00"
 * @returns the same JPEG as a data URL, now carrying EXIF GPS + DateTime tags
 */
export function embedExif(
  base64Jpeg: string,
  lat: number,
  lng: number,
  date: string
): string {
  const exifObj = {
    GPS: {
      [piexif.GPSIFD.GPSLatitudeRef]: lat >= 0 ? "N" : "S",
      [piexif.GPSIFD.GPSLatitude]: toExifGPS(lat),
      [piexif.GPSIFD.GPSLongitudeRef]: lng >= 0 ? "E" : "W",
      [piexif.GPSIFD.GPSLongitude]: toExifGPS(lng),
    },
    "0th": {
      [piexif.ImageIFD.DateTime]: date,
    },
  };

  const exifBytes = piexif.dump(exifObj);
  return piexif.insert(exifBytes, base64Jpeg);
}