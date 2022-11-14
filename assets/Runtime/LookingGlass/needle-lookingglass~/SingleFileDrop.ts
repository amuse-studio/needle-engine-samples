import { Behaviour, DropListener, getComponent, serializeable } from "@needle-tools/engine";

// Documentation → https://docs.needle.tools/scripting

export class SingleFileDrop extends Behaviour {
    
    start() {
        const drop = this.gameObject.getComponent(DropListener);
        drop?.addEventListener('object-added', (evt : CustomEvent) => {

            // clear all children, re-add the new one
            this.gameObject.clear();
            this.gameObject.add(evt.detail.scene);
        });

        // create centered p element
        const div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.top = "15px";
        div.style.width = "100%";
        div.style.pointerEvents = "none";
        div.style.opacity = "0.75";

        div.style.display = 'flex';

        const p = document.createElement('p');
        p.innerText = "Drop .glb files to view them";
        p.style.textAlign = 'center';
        p.style.margin = 'auto';
        p.style.width = '100%';
        p.style.color = 'white';
        
        div.appendChild(p);
        this.context.domElement.appendChild(div);
    }
}