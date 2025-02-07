export default async (request) => {
    const url = new URL(request.url);
    const partoflink = url.searchParams.get("file"); // ?file=<dropbox-file-url>
    if (!partoflink) {
        return new Response("Missing file parameter", { status: 400 });
    }
    const filePath = `https://dl.dropbox.com/scl/fi/${partoflink.replace("//q", "?").replace("//a", "&")}&dl=1`;
    console.log(filePath);
    try {
        const dropboxResponse = await fetch(filePath);
        const contentLength = dropboxResponse.headers.get("Content-Length");
        const maxFileSize = 5 * 1024 * 1024; // 5 MB

        if (contentLength && parseInt(contentLength) > maxFileSize) {
            return new Response("File size exceeds 5 MB limit", { status: 413 });
        }
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