import { GfxDevice } from '../gfx/platform/GfxPlatform';
import { SceneContext } from '../SceneBase';
import { loadArchive } from '../SpongebobRevengeOfTheFlyingDutchman/archive';
import { ROTFDRenderer } from '../SpongebobRevengeOfTheFlyingDutchman/render';
import * as Viewer from '../viewer';

/*
TODO:
 * animated meshes (SKIN + ANIMATION) - ANIMATION files need research
 * PARTICLES - needs research
 * additional material flags (needs research)
 */

const dataBasePath = "JimmyNeutronBoyGenius";

export class JimmySceneDesc implements Viewer.SceneDesc {
    constructor(public id: string, public name: string = id, public gameObj: undefined | string = undefined) {}

    public async createScene(gfxDevice: GfxDevice, context: SceneContext): Promise<Viewer.SceneGfx> {
        const renderer = new ROTFDRenderer(gfxDevice);
        if (this.gameObj !== undefined) {
            const gameobjName = `${dataBasePath}/${this.gameObj}/GAMEOBJ`;
            const gameobj = loadArchive(context.dataFetcher, gameobjName);
            renderer.addArchive(await gameobj);
        }
        const archive = loadArchive(context.dataFetcher, `${dataBasePath}/${this.id}`);
        renderer.addArchive(await archive);

        return renderer;
    }
}

const sceneDescs = [
    'Main Menu',
    new JimmySceneDesc("LEVEL0/DATA/FRONTEND", "Hub"),
    new JimmySceneDesc("LEVEL0/DATA/THEATER", "Theater"),
    'Retroland',
    new JimmySceneDesc("LEVEL1/DATA/LEVEL10", "Entrance", "LEVEL1"),
    new JimmySceneDesc("LEVEL1/DATA/LEVEL11", "Arcade", "LEVEL1"),
    new JimmySceneDesc("LEVEL1/DATA/LEVEL12", "Egyptian Slide", "LEVEL1"),
    new JimmySceneDesc("LEVEL1/DATA/LEVEL13", "Magic Carpets", "LEVEL1"),
    new JimmySceneDesc("LEVEL1/DATA/LEVEL14", "Teeth", "LEVEL1"),
    new JimmySceneDesc("LEVEL1/DATA/LEVEL15", "Volcano", "LEVEL1"),
    new JimmySceneDesc("LEVEL1/DATA/LEVEL18", "Main Area", "LEVEL1"),
    new JimmySceneDesc("LEVEL1/DATA/LEVEL19", "Space Minigame", "LEVEL1"),
    'Retroville',
    new JimmySceneDesc("LEVEL2/DATA/LEVEL20", "Neighborhood", "LEVEL2"),
    new JimmySceneDesc("LEVEL2/DATA/LEVEL21", "Neutron Household", "LEVEL2"),
    new JimmySceneDesc("LEVEL2/DATA/LEVEL29", "Space Minigame 2", "LEVEL2"),
    'Yolkus',
    new JimmySceneDesc("LEVEL3/DATA/LEVEL30", "Landing", "LEVEL3"),
    new JimmySceneDesc("LEVEL3/DATA/LEVEL31", "Mines", "LEVEL3"),
    new JimmySceneDesc("LEVEL3/DATA/LEVEL32", "Fossils", "LEVEL3"),
    new JimmySceneDesc("LEVEL3/DATA/LEVEL39", "Space Minigame 3", "LEVEL3"),
    'Yolkus 2',
    new JimmySceneDesc("LEVEL4/DATA/LEVEL40", "Big Slide", "LEVEL4"),
    new JimmySceneDesc("LEVEL4/DATA/LEVEL41", "Dark Cave", "LEVEL4"),
    new JimmySceneDesc("LEVEL4/DATA/LEVEL42", "Factory", "LEVEL4"),
    'Yolkian City',
    new JimmySceneDesc("LEVEL5/DATA/LEVEL50", "City Exterior", "LEVEL5"),
    new JimmySceneDesc("LEVEL5/DATA/LEVEL51", "Palace", "LEVEL5"),
    'Boss',
    new JimmySceneDesc("LEVEL6/DATA/LEVEL60", "Poultra", "LEVEL6"),
    new JimmySceneDesc("LEVEL6/DATA/LEVEL61", "Hangar", "LEVEL6"),
    new JimmySceneDesc("LEVEL6/DATA/LEVEL62", "Poultra 2", "LEVEL6"),
    new JimmySceneDesc("LEVEL6/DATA/LEVEL63", "King Goobot", "LEVEL6"),
    'Debug',
    new JimmySceneDesc("data/LEVEL7", "Test Level 1"),
    new JimmySceneDesc("data/LEVEL8", "Test Level 2"),
];

const id = 'JimmyNeutronBoyGenius';
const name = "Jimmy Neutron: Boy Genius";
export const sceneGroup: Viewer.SceneGroup = {
    id, name, sceneDescs,
};
