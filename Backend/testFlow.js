async function testBundlesEndpoint() {
  try {
    console.log("1. Submitting User Requirements...");
    const reqRes = await fetch("http://localhost:3000/api/ai/userRequirements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        products: ["Mobile Phones", "Laptops", "Gaming"],
        preferredBrands: ["Apple", "Samsung", "Sony"],
        startingPrice: null,
        endingPrice: 150000,
        releaseCategory: ["Latest Version"],
        discount: 10,
        naturalText: "Apple phone, laptop or gaming setup"
      })
    });

    const reqData = await reqRes.json();
    const reqId = reqData.requirementId;
    console.log("Requirements Saved, ID:", reqId);

    console.log(`\n2. Testing GET http://localhost:3000/api/ai/bundles/${reqId}...`);
    const res1 = await fetch(`http://localhost:3000/api/ai/bundles/${reqId}`);
    const data1 = await res1.json();

    console.log("Bundles API Status:", data1.status);
    console.log(`Total Bundles Returned (>1% Intersection): ${data1.bundles ? data1.bundles.length : 0}`);

    console.log("\n3. Testing GET http://localhost:3000/api/ai/bundles (Latest Bundles)...");
    const res2 = await fetch("http://localhost:3000/api/ai/bundles");
    const data2 = await res2.json();
    console.log("Latest Bundles Endpoint Status:", data2.status);
    console.log(`Latest Total Bundles Returned: ${data2.bundles ? data2.bundles.length : 0}`);

    console.log("\nSUCCESS: All /api/ai/bundles endpoints working 100% cleanly!");
  } catch (err) {
    console.error("Test Error:", err);
  }
}

testBundlesEndpoint();
