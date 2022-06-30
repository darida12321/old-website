// Acts as a bitset in a normal language
class BitSet {
  constructor(size){
    this.size = size
    this.reset()
    return this
  }

  reset(){
    this.bits = []
    for(let i = 0; i < this.size; i++){
      this.bits.push(0)
    }
  }

  set(i){
    this.bits[i] = 1;
    return this
  }
  unset(i){
    this.bits[i] = 0;
    return this
  }

  contains(other){
    if(this.size !== other.size){ return false }
    for(let i = 0; i < this.size; i++){
      if(other.bits[i] === 1 && this.bits[i] === 0){
        return false
      }
    }
    return true
  }
}
class Queue {
  constructor() {
    this.elements = {};
    this.head = 0;
    this.tail = 0;
  }
  enqueue(element) {
    this.elements[this.tail] = element;
    this.tail++;
  }
  dequeue() {
    const item = this.elements[this.head];
    delete this.elements[this.head];
    this.head++;
    return item;
  }
  peek() {
    return this.elements[this.head];
  }
  get length() {
    return this.tail - this.head;
  }
  get isEmpty() {
    return this.length === 0;
  }
}

const MAX_ENTITIES = 256;
const MAX_COMPONENTS = 32;

// Create and destroy entities, get their components
class EntityManager {
  constructor(){
    this.ids = new Queue()
    this.signatures = []
    for(let i = 0; i < MAX_ENTITIES; i++){
      this.ids.enqueue(i)
      this.signatures.push(new BitSet(MAX_COMPONENTS))
    }
  }
  createEntity(){
    return this.ids.dequeue()
  }
  destroyEntity(e){
    this.ids.enqueue(e)
    this.signatures[e] = new BitSet(MAX_COMPONENTS)
  }
  setSignature(e, sig){
    this.signatures[e] = sig;
  }
  getSignature(e){
    return this.signatures[e]
  }
}
// Keep a set of components continuously in memory
class ComponentArray {
  constructor(){
    this.componentArray = []
    this.entityToIndex = {}
    this.indexToEntity = {}
    this.size = 0;
    for(let i = 0; i < MAX_ENTITIES; i++){
      this.componentArray.push(null)
    }
  }
  insertData(e, component){
    this.entityToIndex[e] = this.size
    this.indexToEntity[this.size] = e
    this.componentArray[this.size] = component
    this.size ++
  }
  removeData(e){
    // Move data
    let index = this.entityToIndex[e]
    this.size --;
    this.componentArray[index] = this.componentArray[this.size]

    let lastEntity = this.indexToEntity[this.size]
    this.entityToIndex[lastEntity] = index
    this.indexToEntity[index] = lastEntity

    delete this.entityToIndex[e]
    delete this.indexToEntity[this.size]

    this.componentArray[this.size] = null
  }
  getData(e){
    return this.componentArray[this.entityToIndex[e]]
  }
  entityDestroyed(e){
    if(this.entityToIndex[e]){
      this.removeData(e)
    }
  }
}
// Keep track of different component types
class ComponentManager {
  constructor(){
    this.componentTypes = {}
    this.componentArrays = {}
    this.nextComponentType = 0
  }
  registerComponent(comp){
    this.componentTypes[comp] = this.nextComponentType
    this.componentArrays[comp] = new ComponentArray()
    this.nextComponentType++
  }
  getComponentType(comp){
    return this.componentTypes[comp]
  }
  addComponent(comp, e, data){
    this.componentArrays[comp].insertData(e, data)
  }
  removeComponent(comp, e){
    this.componentArrays[comp].removeData(e)
  }
  getComponent(comp, e){
    return this.componentArrays[comp].getData(e)
  }
  entityDestroyed(e){
    let keys = Object.keys(this.componentArrays)
    for(let i = 0; i < keys.length; i++){
      this.componentArrays[keys[i]].entityDestroyed(e)
    }
  }
}
// System
class System {
  constructor(){
    this.entities = new Set()
  }
}
// Keep track of the signature of systems and their entities
class SystemManager {
  constructor(){
    this.signatures = {}
    this.systems = {}
  }
  registerSystem(system){
    this.systems[system] = new system()
    return this.systems[system]
  }
  setSignature(system, signature){
    this.signatures[system] = signature
  }
  entityDestroyed(e){
    let keys = Object.keys(this.systems)
    for(let i = 0; i < keys.length; i++){
      this.system[keys[i]].entities.delete(e)
    }
  }
  entitySignatureChanged(e, newSig){
    let keys = Object.keys(this.systems)
    for(let i = 0; i < keys.length; i++){
      let systemSig = this.signatures[keys[i]]

      if(newSig.contains(systemSig)){
        this.systems[keys[i]].entities.add(e)
      }else{
        this.systems[keys[i]].entities.delete(e)
      }
    }
  }
}
// Coordinate between the different managers
class ECS {
  constructor(){
    this.entityManager = new EntityManager()
    this.componentManager = new ComponentManager()
    this.systemManager = new SystemManager()
  }

  // Entity
  createEntity(){
    return this.entityManager.createEntity();
  }
  destroyEntity(e){
    this.entityManager.destroyEntity(e);
    this.componentManager.entityDestroyed(e);
    this.systemManager.entityDestroyed(e);
  }

  // Component
  registerComponent(comp){
    this.componentManager.registerComponent(comp)
  }
  addComponent(e, data){
    let comp = data.constructor
    this.componentManager.addComponent(comp, e, data)

    let signature = this.entityManager.getSignature(e)
    signature.set(this.componentManager.getComponentType(comp))
    this.entityManager.setSignature(e, signature)

    this.systemManager.entitySignatureChanged(e, signature)
  }
  removeComponent(comp, e){
    this.componentManager.removeComponent(comp, e)

    let signature = this.entityManager.getSignature(e)
    signature.unset(this.componentManager.getComponentType(comp))
    this.entityManager.setSignature(e, signature)

    this.systemManager.entitySignatureChanged(e, signature)
  }
  getComponent(comp, e){
    return this.componentManager.getComponent(comp, e)
  }
  getComponentType(comp){
    return this.componentManager.getComponentType(comp)
  }

  // System
  registerSystem(system, components){
    let sys = this.systemManager.registerSystem(system)
    let signature = new BitSet(MAX_COMPONENTS)
    for(let i = 0; i < components.length; i++){
      signature.set(this.getComponentType(components[i]))
    }
    this.systemManager.setSignature(system, signature)
    return sys
  }
}

// Components
class Name{
  constructor(name){
    this.name = name
  }
}

// Systems
class Greeter extends System {
  constructor(){
    super()
  }
  run(){
    for (const e of this.entities) {
      let name = ecs.getComponent(Name, e)
      console.log(`Hello, my name is ${name.name}`)
    }
  }
}

var ecs
function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(60);
  ecs = new ECS()

  // Register components
  ecs.registerComponent(Name)

  // Register systems
  let greeter = ecs.registerSystem(Greeter, [Name])

  // Create entities
  let e0 = ecs.createEntity()
  let e1 = ecs.createEntity()
  ecs.addComponent(e0, new Name('Bob'))
  ecs.addComponent(e1, new Name('Eren'))

  greeter.run()
}

function draw() {
  line(0, 0, width, height)
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
