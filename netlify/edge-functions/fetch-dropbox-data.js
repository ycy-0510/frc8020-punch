export default async (request) => {
    const url = new URL(request.url);
    const partoflink = url.searchParams.get("file"); // ?file=<dropbox-file-url>
    const filePath = `https://dl.dropbox.com/scl/fi/${partoflink.replace("//q", "?").replace("//a", "&")}&dl=1`;
    if (!filePath) {
        return new Response("Missing file parameter", { status: 400 });
    }

    try {
        // Step 1: HEAD request to check file size
        const headResponse = await fetch(filePath, { method: "HEAD" });
        const contentLength = headResponse.headers.get("Content-Length");

        if (!contentLength) {
            return new Response("Unable to determine file size", { status: 400 });
        }

        const fileSize = parseInt(contentLength, 10);
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB

        if (fileSize > MAX_SIZE) {
            return new Response("File size exceeds 5MB limit", { status: 413 });
        }

        // Step 2: Fetch and proxy the file
        const dropboxResponse = await fetch(filePath);

        return new Response(dropboxResponse.body, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": dropboxResponse.headers.get("Content-Type") || "application/octet-stream",
                "Content-Disposition": dropboxResponse.headers.get("Content-Disposition") || "attachment",
            },
            status: dropboxResponse.status,
        });
    } catch (error) {
        return new Response("Error fetching file", { status: 500 });
    }
};