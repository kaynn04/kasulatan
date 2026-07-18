const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SIGNATURE_IMAGE_PATTERN = /^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/]+={0,2}$/i;
const MONEY_PATTERN = /^(?:0|[1-9]\d{0,8})(?:\.\d{1,2})?$/;

export function formString(formData: FormData, key: string) {
    const value = formData.get(key);
    return typeof value === "string" ? value.trim() : "";
}

export function normalizeEmail(value: string) {
    return value.trim().toLowerCase();
}

export function isValidEmail(value: string) {
    return value.length <= 254 && EMAIL_PATTERN.test(value);
}

export function isValidSignatureImage(value: string) {
    return !value || (
        value.length <= 700_000
        && SIGNATURE_IMAGE_PATTERN.test(value)
    );
}

export function isValidMoneyAmount(value: string) {
    return MONEY_PATTERN.test(value) && Number(value) > 0;
}

export function isValidDateOnly(value: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
