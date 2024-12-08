import { _decorator, CCFloat, CCInteger, Component, MeshRenderer, Node, Vec2 } from 'cc';
import { MeshCreator } from './MeshCreator';
import { vec2Pool, vec3Pool } from './MathUtils';
const { ccclass, property, requireComponent } = _decorator;

enum DirtyType {
    None = 0,
    Mesh = 1 << 0,
    Material = 1 << 1,
    All = Mesh | Material,
}

@ccclass('Flag')
@requireComponent(MeshRenderer)
export class Flag extends Component {
    @property
    private _size: Vec2 = new Vec2(5, 4);    

    @property({ type: Vec2, tooltip: 'Size of the flag' })
    get size() {
        return this._size;
    }
    
    set size(value: Vec2) {
        this._size = value;
        this._dirty |= DirtyType.Mesh;
    }

    @property
    private _verticePreUnit: number = 5;

    @property({ type: CCInteger, tooltip: 'Vertices per unit' })
    get verticePreUnit() {
        return this._verticePreUnit;
    }

    set verticePreUnit(value: number) {
        this._verticePreUnit = value;
        this._dirty |= DirtyType.Mesh;
    }   

    @property
    private _speed: number = 1;

    @property({ type: CCFloat, tooltip: 'Wave speed', slide: true, range: [0, 10], step: 0.01})
    get speed() {
        return this._speed;
    }

    set speed(val: number) {
        this._speed = val;
        this._dirty |= DirtyType.Material;
    }

    @property
    private _height: number = 1;

    @property({ type: CCFloat, tooltip: 'Wave height in normal', slide: true, range: [0, 10], step: 0.01})
    get height() {
        return this._height;
    }

    set height(val: number) {
        this._height = val;
        this._dirty |= DirtyType.Material;
    }

    private _dirty = DirtyType.None;
    private _meshCreator: MeshCreator;
    private _meshRenderer: MeshRenderer;

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

        const width = this._size.x;
        const height = this._size.y;
        const verticePreUnit = this._verticePreUnit;
        const widthSegments = Math.floor(width * verticePreUnit);
        const heightSegments = Math.floor(height * verticePreUnit);

        for(let j = 0; j <= heightSegments; j++) {
            const y = - j / heightSegments * height;
            for(let i = 0; i <= widthSegments; i++) {
                const x = i / widthSegments * width;
                const v = vec3Pool.alloc();
                v.set(x, y, 0);
                this._meshCreator.verticles.push(v);
                
                const uv = vec2Pool.alloc();
                uv.set(i / widthSegments, j / heightSegments);
                this._meshCreator.uvs.push(uv);
            }
        }

        for(let j = 0; j < heightSegments; j++) {
            for(let i = 0; i < widthSegments; i++) {
                const a = i + (widthSegments + 1) * j;
                const b = i + (widthSegments + 1) * (j + 1);
                const c = (i + 1) + (widthSegments + 1) * (j + 1);
                const d = (i + 1) + (widthSegments + 1) * j;

                this._meshCreator.indices.push(a, b, c);
                this._meshCreator.indices.push(a, c, d);
            }
        }

        this._meshRenderer.mesh = this._meshCreator.buildMesh();
    }

    private updateMaterial() {
        let material = this._meshRenderer.material;
        if(!material) {
            return;
        }

        material.setProperty('speed', this._speed);
        material.setProperty('height', this._height);
    }
}


