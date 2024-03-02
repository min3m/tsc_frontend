import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import {TextGeometry} from 'three/addons/geometries/TextGeometry.js'

const BASE_DOMAIN = 'localhost:8000';
const ROOM_ID = '69133283-5a26-48b8-bfe7-8ffbacd5206b';

class PlayGameApp {
    constructor() {
        const container = document.getElementById("game_playground");
        this._container = container;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        this._renderer = renderer;
        container.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        this._scene = scene;

        this._setupCamera();
        this._setupAmbientLight();
        this._setupLight(-10, 200, 0);
        this._setupTable();
        this._setupMyPaddle();
        this._setupYourPaddle();
        this._setupBall();
        this.setupScore();

        window.resize = this.resize.bind(this);
        this.resize();
        this.listen();
        requestAnimationFrame(this.render.bind(this));
    }

    _setupCamera(x, y, z) {
        const width = this._container.clientWidth;
        const height = this._container.clientHeight;
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
        camera.position.set(0, 715, 425);
        camera.lookAt(0, 120, 0);
        this._camera = camera;
    }

    _moveCamera(x, y, z) {
        if (x !== undefined) this._camera.position.x += x;
        if (y !== undefined) this._camera.position.y += y;
        if (z !== undefined) this._camera.position.z += z;
        // this._camera.lookAt(0, 500, 0);
    }

    _setupAmbientLight() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this._scene.add(ambientLight);
    }

    _setupLight(x, y, z) {
        const color = 0xffffff;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(x, y, z);
        this._scene.add(light);
    }

    _setupTable() {
        const mtlLoader = new MTLLoader();
        mtlLoader.load(
            'src/assets/table.mtl',
            (materlials) => {
                materlials.preload();
                const objLoader = new OBJLoader();
                objLoader.setMaterials(materlials);
                objLoader.load(
                    'src/assets/table.obj',
                    (obj) => {
                        this._scene.add(obj);
                    },
                    (xhr) => {
                        // console.log((xhr.loaded / xhr.total * 100) + '% OBJ loaded');
                    },
                    (err) => console.error('Error:', err)
                );
            },
            (xhr) => {
                // console.log((xhr.loaded / xhr.total * 100) + '% MTL loaded');
            },
            (err) => console.error('Error:', err)
        );
    }

    setupScore(my, your) {
        let myScoreText = 0;
        let yourScoreText = 0;
        if (my !== undefined) myScoreText = my;
        if (your !== undefined) yourScoreText = your;
        const loader = new FontLoader();
        loader.load('src/assets/Poetsen_One_Regular.json', (font) => {

            if (this._yourScore !== undefined) this._scene.remove(this._yourScore);
            if (this._myScore !== undefined) this._scene.remove(this._myScore);

            const yourGeometry = new TextGeometry(`${yourScoreText}`, {
                font: font,
                size: 80,
                height: 1,
                curveSegments: 12,
                bevelEnabled: false
            });
            const yourMaterial = new THREE.MeshPhongMaterial({color: 0xAE70FF});
            const yourScore = new THREE.Mesh(yourGeometry, yourMaterial);

            yourScore.position.set(140, 450, -85);
            yourScore.rotation.set(-(Math.PI / 2), 0, -(Math.PI / 2));

            this._scene.add(yourScore);
            this._yourScore = yourScore;

            const myGeometry = new TextGeometry(`${myScoreText}`, {
                font: font,
                size: 80,
                height: 1,
                curveSegments: 12,
                bevelEnabled: false
            });
            const myMaterial = new THREE.MeshPhongMaterial({color: 0xAE70FF});
            const myScore = new THREE.Mesh(myGeometry, myMaterial);

            myScore.position.set(140, 450, 15);
            myScore.rotation.set(-(Math.PI / 2), 0, -(Math.PI / 2));

            this._scene.add(myScore);
            this._myScore = myScore;
        });
    }

    _setupMyPaddle() {
        const geometry = new THREE.BoxGeometry(60, 25, 20);
        const material = new THREE.MeshPhongMaterial({color: 0x351361});

        const paddle = new THREE.Mesh(geometry, material);

        paddle.position.set(0, 470, 340);

        this._scene.add(paddle);
        this._myPaddle = paddle;
    }

    _setupYourPaddle() {
        const geometry = new THREE.BoxGeometry(60, 25, 20);
        const material = new THREE.MeshPhongMaterial({color: 0x351361});

        const paddle = new THREE.Mesh(geometry, material);

        paddle.position.set(0, 470, -340);

        this._scene.add(paddle);
        this._yourPaddle = paddle;
    }

    _setupBall() {
        const geometry = new THREE.BoxGeometry(25, 25, 25);
        const material = new THREE.MeshPhongMaterial({color: 0xfff385});

        const ball = new THREE.Mesh(geometry, material);

        ball.position.set(0, 470, 0);

        this._scene.add(ball);
        this._ball = ball;
    }

    resize() {
        const width = this._container.clientWidth;
        const height = this._container.clientHeight;

        this._camera.aspect = width / height;
        this._camera.updateProjectionMatrix();

        this._renderer.setSize(width, height);
    }

    render(time) {
        this._renderer.render(this._scene, this._camera);
        this.update(time);
        requestAnimationFrame(this.render.bind(this));
    }

    update(time) {
        // time *= 0.001;
        // this._cube.rotation.x = time;
        // this._cube.rotation.y = time;
    }

    moveMyPaddle(x, y, z) {
        if (x !== undefined) this._myPaddle.position.x += x;
        if (y !== undefined) this._myPaddle.position.y += y;
        if (z !== undefined) this._myPaddle.position.z += z;
    }

    renderBall(x, y, z) {
        if (x !== undefined) this._ball.position.x = x;
        if (y !== undefined) this._ball.position.y = y;
        if (z !== undefined) this._ball.position.z = z;
    }

    renderMyPaddle(x, y, z) {
        if (x !== undefined) this._myPaddle.position.x = x;
        if (y !== undefined) this._myPaddle.position.y = y;
        if (z !== undefined) this._myPaddle.position.z = z;
    }

    renderYourPaddle(x, y, z) {
        if (x !== undefined) this._yourPaddle.position.x = x;
        if (y !== undefined) this._yourPaddle.position.y = y;
        if (z !== undefined) this._yourPaddle.position.z = z;
    }

    listen() {
        const socket = new WebSocket(`ws://${BASE_DOMAIN}/ws/game/${ROOM_ID}/`);

        socket.addEventListener('message', e => {
            /*
                ball_coords: (2) [210, 210]
                player1_coords: (2) [-335, 0]
                player2_coords: (2) [335, 0]
                score: (2) [0, 0]
                type: "send_game_status"
            */
            const data = JSON.parse(e.data);
            if (data.type === 'send_system_message') {
                /*
                message: "Game Start"
                player: 1
                type: "send_system_message"
                */
                if (data.message === 'Game Start') {
                    this._player = data.player;
                    console.log(this._player);
                }
                return;
            } else if (this._player === 1) {
                this.setupScore(data.score[0], data.score[1]);
                this.renderBall(data.ball_coords[1], 470, -data.ball_coords[0]);

                this.renderMyPaddle(data.player1_coords[1], 470, 340);
                this.renderYourPaddle(data.player2_coords[1], 470, -340);

                this._container.addEventListener('keydown', e => {
                    if (e.key === 'ArrowLeft') this._send('up');
                    else if (e.key === 'ArrowRight') this._send('down');
                });
                this._container.addEventListener('keyup', e => {
                    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') this._send('stop');
                });
            } else if (this._player === 2) {
                this.setupScore(data.score[1], data.score[0]);
                this.renderBall(data.ball_coords[1], 470, data.ball_coords[0]);

                this.renderMyPaddle(data.player2_coords[1], 470, 340);
                this.renderYourPaddle(data.player1_coords[1], 470, -340);

                this._container.addEventListener('keydown', e => {
                    e.preventDefault();

                    if (e.key === 'ArrowLeft') this._send('up');
                    else if (e.key === 'ArrowRight') this._send('down');
                });
                this._container.addEventListener('keyup', e => {
                    e.preventDefault();

                    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') this._send('stop');
                });
            }
        });
        this._socket = socket;
    }

    _send(eventName) {
        if (this._socket !== undefined) {
            const data = {
                'move': eventName
            };
            this._socket.send(JSON.stringify(data));
        }
    }
}

export default PlayGameApp;