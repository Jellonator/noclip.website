
import { LiveActor } from "./LiveActor";
import { J3DModelInstance } from "../Common/JSYSTEM/J3D/J3DGraphBase";
import { Camera } from "../Camera";
import { GfxDevice } from "../gfx/platform/GfxPlatform";
import { DrawBufferType, createFilterKeyForDrawBufferType, OpaXlu } from "./NameObj";
import { GfxRenderInstManager } from "../gfx/render/GfxRenderer";
import { NormalizedViewportCoords } from "../gfx/helpers/RenderTargetHelpers";
import { range } from "../MathHelpers";

export const enum LightType {
    None   = -1,
    Player = 0x00,
    Strong = 0x01,
    Weak   = 0x02,
    Planet = 0x03,
    // Not explicitly named, but checked in MR::loadLight and other places.
    Coin   = 0x04,
}

export const enum DrawCameraType {
    DrawCameraType_3D     = 0x00,
    DrawCameraType_2D     = 0x01,
    DrawCameraType_Mirror = 0x02,
}

interface DrawBufferInitialTableEntry {
    DrawBufferType: DrawBufferType;
    DrawCameraType: DrawCameraType;
    LightType: LightType;
};

// Computed from DrawBufferInitialTable -- used in SceneNameObjListExecutor::initCalcViewAndEntryList.
export const drawBufferInitialTable: DrawBufferInitialTableEntry[] = [
    { DrawBufferType: 0x26,                                               LightType: LightType.None,   DrawCameraType: DrawCameraType.DrawCameraType_3D },
    { DrawBufferType: DrawBufferType.PLANET,                              LightType: LightType.Planet, DrawCameraType: DrawCameraType.DrawCameraType_3D },
    { DrawBufferType: DrawBufferType.INDIRECT_PLANET,                     LightType: LightType.Planet, DrawCameraType: DrawCameraType.DrawCameraType_3D },
    { DrawBufferType: DrawBufferType.MARIO_ACTOR,                         LightType: LightType.Player, DrawCameraType: DrawCameraType.DrawCameraType_3D },
    { DrawBufferType: DrawBufferType.TORNADO_MARIO,                       LightType: LightType.Player, DrawCameraType: DrawCameraType.DrawCameraType_3D },
    { DrawBufferType: 0x16,                                               LightType: LightType.Player, DrawCameraType: DrawCameraType.DrawCameraType_3D },
    { DrawBufferType: 0x17,                                               LightType: LightType.Weak,   DrawCameraType: DrawCameraType.DrawCameraType_3D },
    { DrawBufferType: DrawBufferType.NPC,                                 LightType: LightType.Strong, DrawCameraType: DrawCameraType.DrawCameraType_3D },
    { DrawBufferType: DrawBufferType.ENEMY,                               LightType: LightType.Strong, DrawCameraType: DrawCameraType.DrawCameraType_3D },
    { DrawBufferType: DrawBufferType.ENEMY_DECORATION,                    LightType: LightType.Strong, DrawCameraType: DrawCameraType.DrawCameraType_3D },
    { DrawBufferType: 0x1F,                                               LightType: LightType.Strong, DrawCameraType: DrawCameraType.DrawCameraType_3D },
    { DrawBufferType: 0x00,                                               LightType: LightType.Planet, DrawCameraType: DrawCameraType.DrawCameraType_3D },
    { DrawBufferType: 0x18,                                               LightType: LightType.Planet, DrawCameraType: DrawCameraType.DrawCameraType_3D },
    { DrawBufferType: 0x19,                                               LightType: LightType.Planet, DrawCameraType: DrawCameraType.DrawCameraType_3D },
    { DrawBufferType: DrawBufferType.INDIRECT_MAP_OBJ_STRONG_LIGHT,       LightType: LightType.Planet, DrawCameraType: DrawCameraType.DrawCameraType_3D },
    { DrawBufferType: DrawBufferType.INDIRECT_NPC,                        LightType: LightType.Strong, DrawCameraType: DrawCameraType.DrawCameraType_3D },
    { DrawBufferType: DrawBufferType.INDIRECT_ENEMY,                      LightType: LightType.Strong, DrawCameraType: DrawCameraType.DrawCameraType_3D },
    { DrawBufferType: 0x28,                                               LightType: LightType.Planet, DrawCameraType: DrawCameraType.DrawCameraType_3D },
    { DrawBufferType: DrawBufferType.RIDE,                                LightType: LightType.Strong, DrawCameraType: DrawCameraType.DrawCameraType_3D },
    { DrawBufferType: DrawBufferType.NO_SHADOWED_MAP_OBJ,                 LightType: LightType.Planet, DrawCameraType: DrawCameraType.DrawCameraType_3D },
    { DrawBufferType: DrawBufferType.NO_SHADOWED_MAP_OBJ_STRONG_LIGHT,    LightType: LightType.Strong, DrawCameraType: DrawCameraType.DrawCameraType_3D },
    { DrawBufferType: DrawBufferType.NO_SILHOUETTED_MAP_OBJ,              LightType: LightType.Planet, DrawCameraType: DrawCameraType.DrawCameraType_3D },
    { DrawBufferType: DrawBufferType.NO_SILHOUETTED_MAP_OBJ_WEAK_LIGHT,   LightType: LightType.Weak,   DrawCameraType: DrawCameraType.DrawCameraType_3D },
    { DrawBufferType: DrawBufferType.NO_SILHOUETTED_MAP_OBJ_STRONG_LIGHT, LightType: LightType.Strong, DrawCameraType: DrawCameraType.DrawCameraType_3D },
    { DrawBufferType: DrawBufferType.MAP_OBJ,                             LightType: LightType.Planet, DrawCameraType: DrawCameraType.DrawCameraType_3D },
    { DrawBufferType: DrawBufferType.MAP_OBJ_WEAK_LIGHT,                  LightType: LightType.Weak,   DrawCameraType: DrawCameraType.DrawCameraType_3D },
    { DrawBufferType: DrawBufferType.MAP_OBJ_STRONG_LIGHT,                LightType: LightType.Strong, DrawCameraType: DrawCameraType.DrawCameraType_3D },
    { DrawBufferType: DrawBufferType.MIRROR_MAP_OBJ,                      LightType: LightType.Planet, DrawCameraType: DrawCameraType.DrawCameraType_Mirror },
    { DrawBufferType: DrawBufferType.CRYSTAL,                             LightType: LightType.Planet, DrawCameraType: DrawCameraType.DrawCameraType_3D },
    { DrawBufferType: 0x21,                                               LightType: LightType.Strong, DrawCameraType: DrawCameraType.DrawCameraType_3D },
    { DrawBufferType: DrawBufferType.GLARING_LIGHT,                       LightType: LightType.Planet, DrawCameraType: DrawCameraType.DrawCameraType_3D },
    { DrawBufferType: 0x05,                                               LightType: LightType.Planet, DrawCameraType: DrawCameraType.DrawCameraType_3D },
    { DrawBufferType: DrawBufferType.SKY,                                 LightType: LightType.Planet, DrawCameraType: DrawCameraType.DrawCameraType_3D },
    { DrawBufferType: DrawBufferType.AIR,                                 LightType: LightType.Planet, DrawCameraType: DrawCameraType.DrawCameraType_3D },
    { DrawBufferType: DrawBufferType.SUN,                                 LightType: LightType.Planet, DrawCameraType: DrawCameraType.DrawCameraType_3D },
    { DrawBufferType: DrawBufferType.ENVIRONMENT,                         LightType: LightType.Planet, DrawCameraType: DrawCameraType.DrawCameraType_3D },
    { DrawBufferType: DrawBufferType.ENVIRONMENT_STRONG_LIGHT,            LightType: LightType.Planet, DrawCameraType: DrawCameraType.DrawCameraType_3D },
    { DrawBufferType: 0x23,                                               LightType: LightType.Planet, DrawCameraType: DrawCameraType.DrawCameraType_3D },
    { DrawBufferType: DrawBufferType.BLOOM_MODEL,                         LightType: LightType.Planet, DrawCameraType: DrawCameraType.DrawCameraType_3D },
    { DrawBufferType: DrawBufferType._3D_MODEL_FOR_2D,                    LightType: LightType.None,   DrawCameraType: DrawCameraType.DrawCameraType_2D },
    { DrawBufferType: 0x25,                                               LightType: LightType.None,   DrawCameraType: DrawCameraType.DrawCameraType_2D },
];

// The original drawing code's entry point (drawOpa used for example, but drawXlu also exists...)
//
//   static CategoryList::drawOpa(MR::DrawBufferType type):
//     GameSystemSceneController::sInstance->getNameObjListExecutor()->drawOpa(type);
//
//   NameObjListExecutor::drawOpa(int type):
//     this->mDrawBufferHolder->drawOpa(type);
//
//   DrawBufferHolder::drawOpa(int type):
//     this->mDrawBufferGroups[type]->drawOpa();
//
//   DrawBufferGroup::drawOpa():
//     if (this->mLightType != -1)
//       loadLight(this->mLightType);
//     for each (drawBufferExecuter in this->mDrawBufferExecuters)
//       drawBufferExecuter->drawOpa();
//
//   DrawBufferExecuter::drawOpa():
//     if (this->mLightType != -1)
//       MR::loadLight(this->mLightType);
//     this->mDrawBuffer->drawOpa();

// DrawBufferHolder is effectively a singleton. It holds DrawBufferGroups, of which there is one per DrawBufferType.
// DrawBufferGroups contain DrawBufferExecuter's, which are 1:1 with a model. Each instance of a model is recorded
// in the DrawBufferExecuter, and the shared model data goes in a DrawBuffer. Each DrawBuffer contains a number
// of DrawBufferShapeDrawers, which is roughly equivalent to our *MaterialInstance*. Each DrawBufferShapeDrawer
// contains multiple J3DShapePackets.

class DrawBufferExecuter {
    public materialOrderOpa: number[] = [];
    public materialOrderXlu: number[] = [];

    constructor(public modelInstance: J3DModelInstance) {
        const modelData = this.modelInstance.modelData;

        const materialOrder = range(0, modelData.modelMaterialData.materialData!.length);

        // Sort shapes by material name. Yes, this is what the actual game does.
        // ref. DrawBuffer::sortShapeDrawer.
        materialOrder.sort((a, b) => {
            const mata = modelData.modelMaterialData.materialData![a].material;
            const matb = modelData.modelMaterialData.materialData![b].material;
            return mata.name.localeCompare(matb.name);
        });

        for (let i = 0; i < materialOrder.length; i++) {
            if (modelData.modelMaterialData.materialData![materialOrder[i]].material.translucent)
                this.materialOrderXlu.push(materialOrder[i]);
            else
                this.materialOrderOpa.push(materialOrder[i]);
        }
    }

    private draw(device: GfxDevice, renderInstManager: GfxRenderInstManager, camera: Camera, viewport: NormalizedViewportCoords, order: number[], depth: number): void {
        if (!this.modelInstance.visible || !this.modelInstance.isAnyShapeVisible())
            return;

        for (let i = 0; i < order.length; i++) {
            const materialInstance = this.modelInstance!.materialInstances[order[i]];
            if (!materialInstance.visible)
                continue;
            materialInstance.prepareToRenderShapes(device, renderInstManager, depth, camera, viewport, this.modelInstance.modelData, this.modelInstance.materialInstanceState, this.modelInstance.shapeInstanceState);
        }
    }

    public drawOpa(device: GfxDevice, renderInstManager: GfxRenderInstManager, camera: Camera, viewport: NormalizedViewportCoords): void {
        const depth = -1;
        this.draw(device, renderInstManager, camera, viewport, this.materialOrderOpa, depth);
    }

    public drawXlu(device: GfxDevice, renderInstManager: GfxRenderInstManager, camera: Camera, viewport: NormalizedViewportCoords): void {
        const depth = this.modelInstance.computeDepth(camera);
        this.draw(device, renderInstManager, camera, viewport, this.materialOrderXlu, depth);
    }
}

export class DrawBufferGroup {
    private drawBufferExecuters: DrawBufferExecuter[] = [];

    constructor(public tableEntry: DrawBufferInitialTableEntry) {
    }

    public drawOpa(device: GfxDevice, renderInstManager: GfxRenderInstManager, camera: Camera, viewport: NormalizedViewportCoords): void {
        for (let i = 0; i < this.drawBufferExecuters.length; i++)
            this.drawBufferExecuters[i].drawOpa(device, renderInstManager, camera, viewport);
    }

    public drawXlu(device: GfxDevice, renderInstManager: GfxRenderInstManager, camera: Camera, viewport: NormalizedViewportCoords): void {
        for (let i = 0; i < this.drawBufferExecuters.length; i++)
            this.drawBufferExecuters[i].drawXlu(device, renderInstManager, camera, viewport);
    }

    public registerDrawBuffer(actor: LiveActor): number {
        // TODO(jstpierre): Do we need the DrawBuffer / DrawBufferExecuter split?
        this.drawBufferExecuters.push(new DrawBufferExecuter(actor.modelInstance!));
        return this.drawBufferExecuters.length - 1;
    }

    public findLightInfo(actor: LiveActor, drawBufferIndex: number): void {
        // Will also set the mpDrawBuffer on the ActorLightCtrl -- not sure why yet...
        actor.actorLightCtrl!.lightType = this.tableEntry.LightType;
    }

    public hasVisible(): boolean {
        for (let i = 0; i < this.drawBufferExecuters.length; i++)
            if (this.drawBufferExecuters[i].modelInstance.visible)
                return true;
        return false;
    }
}

export class DrawBufferHolder {
    public groups: DrawBufferGroup[] = [];

    constructor(table: DrawBufferInitialTableEntry[]) {
        for (let i = 0; i < table.length; i++) {
            const entry = table[i];
            this.groups[entry.DrawBufferType] = new DrawBufferGroup(entry);
        }
    }

    public registerDrawBuffer(actor: LiveActor, drawBufferType: DrawBufferType): number {
        return this.groups[drawBufferType].registerDrawBuffer(actor);
    }

    public findLightInfo(actor: LiveActor, drawBufferType: DrawBufferType, drawBufferIndex: number): void {
        this.groups[drawBufferType].findLightInfo(actor, drawBufferIndex);
    }

    public findLightType(drawBufferType: DrawBufferType): LightType {
        if (drawBufferType < 0)
            return LightType.None;
        return this.groups[drawBufferType].tableEntry.LightType;
    }

    public drawAllBuffers(device: GfxDevice, renderInstManager: GfxRenderInstManager, camera: Camera, viewport: NormalizedViewportCoords, cameraType: DrawCameraType): void {
        for (let i = 0; i < this.groups.length; i++) {
            const group = this.groups[i];
            if (group === undefined)
                continue;
            if (group.tableEntry.DrawCameraType !== cameraType)
                continue;
            this.drawOpa(device, renderInstManager, camera, viewport, i);
            this.drawXlu(device, renderInstManager, camera, viewport, i);
        }
    }

    private drawOpa(device: GfxDevice, renderInstManager: GfxRenderInstManager, camera: Camera, viewport: NormalizedViewportCoords, drawBufferType: DrawBufferType): void {
        const template = renderInstManager.pushTemplateRenderInst();
        template.filterKey = createFilterKeyForDrawBufferType(OpaXlu.OPA, drawBufferType);
        this.groups[drawBufferType].drawOpa(device, renderInstManager, camera, viewport);
        renderInstManager.popTemplateRenderInst();
    }

    private drawXlu(device: GfxDevice, renderInstManager: GfxRenderInstManager, camera: Camera, viewport: NormalizedViewportCoords, drawBufferType: DrawBufferType): void {
        const template = renderInstManager.pushTemplateRenderInst();
        template.filterKey = createFilterKeyForDrawBufferType(OpaXlu.XLU, drawBufferType);
        this.groups[drawBufferType].drawXlu(device, renderInstManager, camera, viewport);
        renderInstManager.popTemplateRenderInst();
    }

    public drawBufferHasVisible(drawBufferType: DrawBufferType): boolean {
        return this.groups[drawBufferType].hasVisible();
    }
}
