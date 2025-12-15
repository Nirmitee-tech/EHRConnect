const crypto = require("crypto");

// Plain text (must be string or Buffer)
const plainText = "946495363918";

// Public key (BASE64, without headers)
const publicKeyBase64 = `MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAstWB95C5pHLXiYW59qyO4Xb+59KYVm9Hywbo77qETZVAyc6VIsxU+UWhd/k/YtjZibCznB+HaXWX9TVTFs9Nwgv7LRGq5uLczpZQDrU7dnGkl/urRA8p0Jv/f8T0MZdFWQgks91uFffeBmJOb58u68ZRxSYGMPe4hb9XXKDVsgoSJaRNYviH7RgAI2QhTCwLEiMqIaUX3p1SAc178ZlN8qHXSSGXvhDR1GKM+y2DIyJqlzfik7lD14mDY/I4lcbftib8cv7llkybtjX1AayfZp4XpmIXKWv8nRM488/jOAF81Bi13paKgpjQUUuwq9tb5Qd/DChytYgBTBTJFe7irDFCmTIcqPr8+IMB7tXA3YXPp3z605Z6cGoYxezUm2Nz2o6oUmarDUntDhq/PnkNergmSeSvS8gD9DHBuJkJWZweG3xOPXiKQAUBr92mdFhJGm6fitO5jsBxgpmulxpG0oKDy9lAOLWSqK92JMcbMNHn4wRikdI9HSiXrrI7fLhJYTbyU3I4v5ESdEsayHXuiwO/1C8y56egzKSw44GAtEpbAkTNEEfK5H5R0QnVBIXOvfeF4tzGvmkfOO6nNXU3o/WAdOyV3xSQ9dqLY5MEL4sJCGY1iJBIAQ452s8v0ynJG5Yq+8hNhsCVnklCzAlsIzQpnSVDUVEzv17grVAw078CAwEAAQ==`.replace(/\s+/g, "");

// Convert Base64 → PEM
const publicKeyPem = `
-----BEGIN PUBLIC KEY-----
${publicKeyBase64.match(/.{1,64}/g).join("\n")}
-----END PUBLIC KEY-----
`;

// Encrypt
const encryptedBuffer = crypto.publicEncrypt(
    {
        key: publicKeyPem,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha1", // IMPORTANT: SHA-1 (matches RSA/ECB/OAEPWithSHA-1AndMGF1Padding)
    },
    Buffer.from(plainText, "utf8")
);

// Output Base64
const encryptedBase64 = encryptedBuffer.toString("base64");
console.log("Encrypted Output (Base64):");
console.log(encryptedBase64);
