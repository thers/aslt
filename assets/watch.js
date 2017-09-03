const fs = require('fs');
const cp = require('child_process');
const path = require('path');

const [_, _1, file, dest] = process.argv;

console.log(`
> Watching for changes of ${file}
> Will copy on change to ${dest}
`);

const srcFileName = path.basename(file);
const destFile = path.resolve(dest, path.basename(file));

let to = null;

fs.watchFile(file, curr => {
	console.log('> File modified, size: ', curr.size/1024|0, 'kb');
	console.log('> Exporting to GFX');

	if (to !== null) {
		clearTimeout(to);
	}

	setTimeout(() => {
		cp.exec(`gfxexport ${srcFileName}`, () => {
			const stream = fs.createReadStream(file.replace('swf', 'gfx'));

			stream.on('end', () => console.log('> Copied file to dest', `\n\n`));

			stream.pipe(fs.createWriteStream(destFile.replace('swf', 'gfx')));
		});
	}, 200);
});
