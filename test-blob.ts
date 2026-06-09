import { put } from "@vercel/blob";

async function testBlob() {
  try {
    const rawRWToken = "vercel_blob_rw_1234567890123456_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    console.log("Calling put()");
    
    await put("test.txt", "hello", {
      access: 'private',
      token: rawRWToken,
      contentType: 'text/plain'
    });
    console.log("Success");
  } catch (err: any) {
    console.log("ERROR TYPE:", err.name);
    console.log("MESSAGE:", err.message);
  }
}

testBlob();
