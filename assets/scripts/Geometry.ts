import { _decorator, CCFloat, CCInteger, Component, Enum, MeshRenderer, Node, Vec2 } from 'cc';
import { MeshCreator } from './MeshCreator';
import { vec2Pool, vec3Pool } from './MathUtils';
const { ccclass, property, requireComponent } = _decorator;

enum DirtyType {
    None = 0,
    Mesh = 1 << 0,
    Material = 1 << 1,
    All = Mesh | Material,
}

const GeometryType = Enum({
    Triangle: 0,
    Quad: 1,
});

@ccclass('Geometry')
@requireComponent(MeshRenderer)
export class Geometry extends Component {    
    private _dirty = DirtyType.None;
    private _meshCreator: MeshCreator;
    private _meshRenderer: MeshRenderer;

    @property({ type: GeometryType })
    private _geometryType = GeometryType.Triangle;

    @property({ type: GeometryType, tooltip: 'Type of geometry' })
    public get geometryType() {
        return this._geometryType;
    }

    public set geometryType(value: number) {
        this._geometryType = value;
        this._dirty |= DirtyType.Mesh;
    }

    start() {
        this._init();
        this.build();
    }

    private _init() {
        if (!this._meshRenderer || !this._meshCreator) {
            this._meshRenderer = this.getComponent(MeshRenderer);
            this._meshCreator = new MeshCreator(false);
            this._meshCreator.normal.set(0, 0, 1);
        }
    }

    onFocusInEditor(): void {
        this._init();
        this.build();
    }

    update(deltaTime: number) {
        if((this._dirty & DirtyType.Mesh) === DirtyType.Mesh) {
            this.buildMesh();
        }

        if((this._dirty & DirtyType.Material) === DirtyType.Material) {
            this.updateMaterial();            
        }
    }

    public build() {
        this.buildMesh();
        this.updateMaterial();
    }

    private buildMesh() {
        this._dirty = DirtyType.None;        
        this._meshCreator.reset();

        if(this._geometryType === GeometryType.Triangle) {
            this.createTriangle();
        }else if(this._geometryType === GeometryType.Quad) {
            this.createQuad();
        }

        this._meshRenderer.mesh = this._meshCreator.buildMesh();
    }

    private createTriangle() {
        this._meshCreator.reset();

        let p0 = vec3Pool.alloc().set(0, 0, 0);
        let p1 = vec3Pool.alloc().set(1, 0, 0);
        let p3 = vec3Pool.alloc().set(0, -1, 0);

        this._meshCreator.verticles.push(p0 , p1, p3);

        let uv0 = vec2Pool.alloc().set(0, 0);
        let uv1 = vec2Pool.alloc().set(1, 0);
        let uv2 = vec2Pool.alloc().set(0, 1);
        this._meshCreator.uvs.push(uv0, uv1, uv2);

        this._meshCreator.indices.push(0, 2, 1);
    }

    private createQuad() {
        this._meshCreator.reset();

        let p0 = vec3Pool.alloc().set(0, 0, 0);
        let p1 = vec3Pool.alloc().set(1, 0, 0);
        let p2 = vec3Pool.alloc().set(1, -1, 0);
        let p3 = vec3Pool.alloc().set(0, -1, 0);

        this._meshCreator.verticles.push(p0, p1, p2, p3);

        let uv0 = vec2Pool.alloc().set(0, 0);
        let uv1 = vec2Pool.alloc().set(1, 0);
        let uv2 = vec2Pool.alloc().set(1, 1);
        let uv3 = vec2Pool.alloc().set(0, 1);
        this._meshCreator.uvs.push(uv0, uv1, uv2, uv3);
        
        this._meshCreator.indices.push(0, 2, 1, 0, 3, 2);
    }

    private updateMaterial() {
        let material = this._meshRenderer.material;
        if(!material) {
            return;
        }        
    }
}


