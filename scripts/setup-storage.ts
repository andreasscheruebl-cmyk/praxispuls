/**
 * Setup Supabase Storage bucket for logo uploads.
 * Run: npx tsx scripts/setup-storage.ts
 *
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  console.log("Checking Supabase Storage buckets...\n");

  // List existing buckets
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error("Failed to list buckets:", listError.message);
    process.exit(1);
  }

  console.log("Existing buckets:", buckets.map((b) => b.name).join(", ") || "(none)");

  // Check if "logos" bucket exists
  const logosBucket = buckets.find((b) => b.name === "logos");

  if (logosBucket) {
    console.log('\n"logos" bucket already exists.');

    // Ensure it's public
    if (!logosBucket.public) {
      console.log("Making bucket public...");
      const { error } = await supabase.storage.updateBucket("logos", {
        public: true,
        fileSizeLimit: 2 * 1024 * 1024, // 2 MB
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
      });
      if (error) {
        console.error("Failed to update bucket:", error.message);
      } else {
        console.log("Bucket updated to public.");
      }
    } else {
      console.log("Bucket is already public.");
    }
  } else {
    // Create the bucket
    console.log('\nCreating "logos" bucket...');
    const { error } = await supabase.storage.createBucket("logos", {
      public: true,
      fileSizeLimit: 2 * 1024 * 1024, // 2 MB
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
    });

    if (error) {
      console.error("Failed to create bucket:", error.message);
      process.exit(1);
    }
    console.log('"logos" bucket created successfully!');
  }

  // Verify by uploading a tiny test image and removing it
  console.log("\nVerifying upload permissions...");
  const testBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64"
  );

  const { error: uploadError } = await supabase.storage
    .from("logos")
    .upload("_test/verify.png", testBuffer, { contentType: "image/png", upsert: true });

  if (uploadError) {
    console.error("Upload test failed:", uploadError.message);
    console.error("Logo uploads will NOT work until this is resolved.");
    process.exit(1);
  }

  // Clean up test file
  await supabase.storage.from("logos").remove(["_test/verify.png"]);

  // Get public URL to verify
  const { data: { publicUrl } } = supabase.storage.from("logos").getPublicUrl("_test/verify.png");
  console.log("Public URL pattern:", publicUrl.replace("_test/verify.png", "<practice-id>/logo.<ext>"));

  console.log("\nStorage setup complete! Logo uploads are ready.");
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
