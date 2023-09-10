import { Behaviour, delay, isMobileDevice, serializable } from "@needle-tools/engine";
import nipplejs from "nipplejs";
import { FirstPersonController } from "./FirstPersonCharacter";
import { Vector2 } from "three";

export class MobileControls extends Behaviour {

    @serializable(FirstPersonController)
    controller?: FirstPersonController;

    movementSensitivity: number = 1;
    lookSensitivity: number = 5;

    // See https://github.com/yoannmoinet/nipplejs for all options
    private _movement?: nipplejs.JoystickManager;
    private _look?: nipplejs.JoystickManager;

    private _movementIsActive = false;
    private _movementVector!: Vector2;
    private _lookIsActive = false;
    private _lookVector!: Vector2;

    private _htmlElements: HTMLElement[] = [];

    awake(): void {
        this._lookVector = new Vector2();
        this._movementVector = new Vector2();
    }

    bindTo(controller: FirstPersonController) {
        if (controller !== this.controller) {
            this.onDisable();
            this.controller = controller;
            this.onEnable();
        }
    }

    onEnable() {
        // Onle enable touch controls on mobile
        if (!isMobileDevice()) return;

        const dynamicContainer = document.createElement('div');
        dynamicContainer.id = 'look-joystick';
        dynamicContainer.style.cssText = `
                position: absolute;
                top: 0%;
                left: 0%;
                width: 100%;
                height: 100%;
            `
        const staticContainer = document.createElement('div');
        staticContainer.id = 'movement-joystick';
        staticContainer.style.cssText = `
                position: absolute;
                top: 80%;
                left: 0%;
                width: 40%;
                height: 20%;
            `
        this.context.domElement.append(dynamicContainer);
        this.context.domElement.append(staticContainer);
        this._htmlElements.push(dynamicContainer);
        this._htmlElements.push(staticContainer);

        const pixelThreshold = 10;
        this._movement = nipplejs.create({
            mode: 'static',
            position: { left: '50%', top: '50%' },
            catchDistance: 1000,
            zone: staticContainer,
            size: 130,
        });
        this._movement.on('start', () => { this._movementIsActive = true; });
        this._movement.on('move', (_, data) => {
            if (data.distance > pixelThreshold)
                this._movementVector.set(data.vector.x, data.vector.y).multiplyScalar(this.movementSensitivity);
            else this._movementVector.set(0, 0);
        });
        this._movement.on('end', () => { this._movementIsActive = false; });


        const fullRotationSpeedDistance = 130 / 2;
        this._look = nipplejs.create({
            mode: 'dynamic',
            catchDistance: 1000,
            maxNumberOfNipples: 1,
            zone: dynamicContainer,
            size: 130,
            color: "#ffffff33",
        });
        this._look.on('start', () => { this._lookIsActive = true; });
        this._look.on('move', (_, data) => {
            if (data.distance > pixelThreshold)
                this._lookVector.set(data.vector.x, data.vector.y * -1).multiplyScalar(this.lookSensitivity * data.distance / fullRotationSpeedDistance);
            else this._lookVector.set(0, 0);
        });
        let lastLookEndTime: number = 0;
        this._look.on('end', () => {
            this._lookIsActive = false;
            // double tap to jump:
            const now = Date.now();
            if (now - lastLookEndTime < 150) {
                this.controller?.jump();
            }
            lastLookEndTime = now;
        });

    }

    onDisable(): void {
        this._movement?.destroy();
        this._look?.destroy();
        for (const html of this._htmlElements)
            html.remove();
        this._htmlElements.length = 0;
    }

    update() {
        if (this._movementIsActive) {
            this.controller?.move(this._movementVector);
        }

        if (this._lookIsActive) {
            this.controller?.look(this._lookVector);
        }

    }
}