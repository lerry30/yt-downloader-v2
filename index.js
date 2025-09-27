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
        // For audio, get best quality audio
        args.push("--format", "bestaudio");
    } else if (type === "video") {
        // For video, use best quality format that includes both video and audio
        let format = options.quality;
        
        if (!format) {
            // Default to best quality video+audio, fallback to best available
            format = "bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best[ext=mp4]/best";
        }
        
        args.push("--format", format);
        
        if (options.videoFormat) {
            args.push("--recode-video", options.videoFormat);
        }
        
        // Merge video and audio into single file if separate streams
        args.push("--merge-output-format", options.mergeFormat || "mp4");
    }
    
    // Optional: Add progress display
    if (options.showProgress !== false) {
        args.push("--progress");
    }
    
    return new Promise((resolve, reject) => {
        const ytdlp = spawn("yt-dlp", args);
        
        ytdlp.stdout.on("data", (data) => {
            console.log(`yt-dlp: ${data}`);
        });
        
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
            n: 'mp3', no: 'mp3', N: 'mp3', NO: 'mp3'
        };

    const type = restype[String(rtype).toLowerCase()];
    console.log(type);
    if(!type) return;
    
    await downloadMedia(videoLink, videoName, type);
}

start();














