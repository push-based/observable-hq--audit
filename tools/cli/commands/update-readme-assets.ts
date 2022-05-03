import {YargsCommandObject} from '../core/model';
import {getCliParam} from '../core/utils';
import {formatBytes, readFile, toTimelineViewSingleUrl} from '../utils';
import * as fs from 'fs';
import {join} from 'path';

const repo = "https://raw.githubusercontent.com/push-based/observable-hq--audit/master/";


export async function run(): Promise<void> {
    const folderPath: string = getCliParam(['folder', 's']) || 'assets';
    const readmePath: string = getCliParam(['target', 't']) || './readme.md';

    console.log('folderPath', folderPath)
    const fileNames = fs.readdirSync(folderPath);
    const readme = readFile(readmePath, 'string');

    const [top, rest] = readme.split('<!-- assets-info-start -->');
    if (rest === undefined) {
        throw new Error(
            `The target file does not contain valid tags. "<!-- assets-info-start -->" & "<!-- assets-info-end -->"`
        );
    }
    const [_, bottom] = rest.split('<!-- assets-info-end -->');

    const initialAssets = fileNames
        .filter(f => {
            if (f.split('.').pop() === 'json') {
                const filePath = join(folderPath, f);
                const profile = readFile(filePath, 'json');
                if (isPerformanceProfile(profile)) {
                    return true;
                }
                return false;
            }
            return false;
        })
        .map(fileName => {
            const filePath = join(folderPath, fileName);
            return ({
                name: fileName,
                path: filePath,
                size: fs.statSync(filePath).size
            })
        });


    let statsContent =
        top +
        `
<!-- assets-info-start -->
| Name             | Timeline        | Size        |
| ---              | ---             | ---         |`;

    initialAssets.forEach(({name, size, path}) => {
        statsContent += `
| [${name}](${join(repo, path)}) | [${'timeline-view'}](${toTimelineViewSingleUrl(path, repo)}) | ${formatBytes(size)}|`;
    });

    statsContent += `<!-- assets-info-end -->` + bottom;

    fs.writeFileSync(readmePath, statsContent);

    return new Promise((resolve) => resolve());
}

const command = 'update-readme-assets';

export const updateAssetsCommand: YargsCommandObject = {
    command,
    description: 'Update assets',
    module: {
        handler: async (argv) => {
            if (argv.verbose) console.info(`run "${command}" as a yargs command`);

            return run();

        },
    },
};

function isPerformanceProfile(json: any[]): boolean {
    try {
        const k = Object.keys(json[0]);
        return k[0] === 'args' && k[1] === 'cat' && k[2] === 'name';
    } catch (e) {
        console.error(e);
    }
}
