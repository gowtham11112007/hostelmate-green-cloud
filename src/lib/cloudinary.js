const CLOUDINARY_CLOUD = 'k8dpkjin';
const CLOUDINARY_PRESET = 'hostelmate_unsigned';

export async function uploadPhoto(file) {
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', CLOUDINARY_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
    method: 'POST',
    body: form
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data.error && data.error.message) || `Photo upload failed (${res.status})`);
  }
  return data.secure_url.replace('/upload/', '/upload/f_auto,q_auto,w_1200/');
}
