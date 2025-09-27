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
    } else if (type === "video") {
        // Video with audio (default behavior)
        if (options.quality) {
            args.push("--format", options.quality);
        }
        if (options.videoFormat) {
            args.push("--recode-video", options.videoFormat);
        }
    }

    return new Promise((resolve, reject) => {
        const ytdlp = spawn("yt-dlp", args);

        ytdlp.stderr.on("data", (data) => {
            console.log(`yt-dlp: ${data}`);
        });

        ytdlp.on("close", (code) => {
            code === 0 ? resolve() : reject(new Error(`Process exited with code ${code}`));
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
    const rtype = await prompt('MP4(yes default)/MP3(no): ');
    const restype = {
            y: 'mp4', yes: 'mp4', Y: 'mp4', YES: 'mp4',
            n: 'mp4', no: 'mp4', N: 'mp4', NO: 'mp4'
        };

    const type = restype[String(rtype).toLowerCase()];
    console.log(type);
    if(!type) return;
    
    const options = {quality: 'best'};
    
    await downloadMedia(videoLink, videoName, type, options);
}

start();














