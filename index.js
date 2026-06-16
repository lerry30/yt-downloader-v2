const { spawn } = require('child_process');
const { createInterface } = require('readline');

const readline = createInterface({
	input: process.stdin,
	output: process.stdout
});

function downloadMedia(url, outputPath, type = "video", options = {}) {
    const args = [url, "--output", outputPath];

    if (type === "audio") {
        args.push("--extract-audio", "--audio-format", options.audioFormat || "mp3");
        args.push("--format", "bestaudio/best");
    } else if (type === "video") {
        let format = options.quality;

        if (!format) {
            // Best separate video+audio streams (any codec), merged into mp4
            // Falls back to best single-file stream if merging isn't possible
            format = "bestvideo+bestaudio/best";
        }

        args.push("--format", format);

        // Always merge into mp4 for compatibility
        args.push("--merge-output-format", options.mergeFormat || "mp4");

        if (options.videoFormat) {
            args.push("--recode-video", options.videoFormat);
        }
    }

    // Prefer ffmpeg for merging (higher quality than avconv)
    args.push("--prefer-ffmpeg");

    if (options.showProgress !== false) {
        args.push("--progress");
    }

    return new Promise((resolve, reject) => {
        const ytdlp = spawn("yt-dlp", args);

        ytdlp.stdout.on("data", (data) => process.stdout.write(`yt-dlp: ${data}`));
        ytdlp.stderr.on("data", (data) => process.stderr.write(`yt-dlp: ${data}`));

        ytdlp.on("close", (code) => {
            code === 0 ? resolve() : reject(new Error(`yt-dlp exited with code ${code}`));
        });
    });
}

async function prompt(question) {
	const readLineAsync = msg => {
		return new Promise(resolve => {
			readline.question(msg, userRes => resolve(userRes));
		});
	}

	const userRes = await readLineAsync(question);
	return userRes;
}

async function start() {
    const videoLink = await prompt('Paste the URL: ');
    const videoName = await prompt('Enter filename: ');
    const rtype = await prompt('MP3(yes)? Default MP4: ');
    const restype = {
            y: 'audio', yes: 'audio',
            n: 'video', no: 'video'
        };

    const type = restype[String(rtype).toLowerCase()] || 'video';
    const extension = type==='video' ? 'mp4' : 'mp3';
    const fullPath = `output/${videoName}.${extension}`; 
    
    await downloadMedia(videoLink, fullPath, type);

    process.exit(0);
}

start();














