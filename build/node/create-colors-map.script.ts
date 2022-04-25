import { readFile, writeFile } from 'fs/promises';
import { Color } from '../../projects/kit/src/internal/declarations/classes/color.class';
import { ColorsConfig } from '../../projects/kit/src/internal/declarations/interfaces/colors-config.interface';

async function writeContentToFile(fileData: string): Promise<void> {
  await writeFile('./projects/kit/src/styles/maps/colors.map.scss', fileData, null);
}

async function getColorsMapScssFileContent(): Promise<string> {
  return await readFile('./projects/kit/src/assets/configs/colors-config.json', { encoding: 'utf8' })
    .then((content: string) => JSON.parse(content))
    .then((colorGroups: ColorsConfig.Group[]) => {
      const colors: Color[] = [];
      for (const colorGroup of colorGroups) {
        for (const colorData of colorGroup.colors) {
          colors.push(new Color(colorData));
        }
      }

      const colorsMapElements: string[] = colors.map((color: Color) => `'${color.key}': #${color.hex}`);

      const emptyFileContent: string =
        '/** @file Automatically generated by create-colors-map.script.ts. Edit colors-config.json*/\n';
      const colorsMapElementsString: string = colorsMapElements.join(',\n  ');
      return `${emptyFileContent}\n$colorsMap: (\n  ${colorsMapElementsString},\n);\n`;
    });
}

Promise.resolve()
  .then(() => getColorsMapScssFileContent())
  .then((fileData: string) => writeContentToFile(fileData));