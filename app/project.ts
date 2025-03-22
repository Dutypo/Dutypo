import generateHash from './hash'

interface ScriptParams {
  type: string
  params?: (Script | string | number | null)[]
  statements?: Script[][]
  x?: number
  y?: number
}

class Script {
  id = generateHash(4)
  x
  y
  type
  params
  statements
  constructor(type: string)
  constructor({ type, params, statements, x, y }: ScriptParams)
  constructor(argument: string | ScriptParams) {
    if (typeof argument == 'string') {
      this.type = argument
      return
    }
    const { type, params, statements, x, y } = argument
    this.type = type
    this.params = params
    this.statements = statements
    this.x = x
    this.y = y
  }
}

const createVideoProject = ({ name, width, height, pictures, duration, fps, frames, audioHash, useDummyCode }: { name: string, width: number, height: number, pictures: string[], duration: number, fps: number, frames: number, audioHash: string, useDummyCode: boolean }) => ({
  objects: [{
    id: '7y0y',
    name,
    objectType: 'sprite',
    rotateMethod: 'free',
    scene: '7dwq',
    lock: false,
    entity: {
      x: 0,
      y: 0,
      regX: 320,
      regY: 180,
      scaleX: 480 / width,
      scaleY: 270 / height,
      rotation: 0,
      direction: 90,
      width,
      height,
      font: 'undefinedpx ',
      visible: true,
    },
    sprite: {
      pictures: pictures.map(hash => ({
        id: generateHash(4),
        dimension: {
          width,
          height,
        },
        fileurl: `temp/${hash.substring(0, 2)}/${hash.substring(2, 4)}/image/${hash}.png`,
        filename: hash,
        name: hash,
        imageType: 'png',
      })),
      sounds: [{
        duration: Math.round(duration * 10) / 10,
        ext: '.mp3',
        id: generateHash(4),
        fileurl: `temp/${audioHash.substring(0, 2)}/${audioHash.substring(2, 4)}/${audioHash}.mp3`,
        filename: audioHash,
        name: audioHash,
        imageType: 'png',
      }],
    },
    script: JSON.stringify([[new Script({
      type: 'when_run_button_click',
    }), new Script({
      type: 'start_scene',
    })], [new Script({
      type: 'when_scene_start',
    }), ...(useDummyCode ? [new Script({
      type: 'reset_project_timer',
    })] : [new Script({
      type: 'choose_project_timer_action',
      params: [null, 'RESET'],
    })]), new Script({
      type: 'choose_project_timer_action',
    }), new Script({
      type: 'sound_something_with_block',
      params: [new Script({
        type: 'number',
        params: [1],
      })],
    }), new Script({
      type: 'repeat_while_true',
      params: [new Script({
        type: useDummyCode ? 'boolean_smaller' : 'boolean_basic_operator',
        params: [new Script({
          type: 'get_project_timer_value',
        }), useDummyCode ? null : 'LESS', new Script({
          type: 'number',
          params: [frames / fps],
        })],
      }), 'while'],
      statements: [[new Script({
        type: 'change_to_some_shape',
        params: [new Script({
          type: useDummyCode ? 'calc_plus' : 'calc_basic',
          params: [new Script({
            type: 'calc_operation',
            params: [null, new Script({
              type: useDummyCode ? 'calc_times' : 'calc_basic',
              params: [new Script({
                type: 'get_project_timer_value',
              }), useDummyCode ? null : 'MULTI', new Script({
                type: 'number',
                params: [fps],
              })],
            }), null, 'floor'],
          }), useDummyCode ? null : 'PLUS', new Script({
            type: 'number',
            params: [1],
          })],
        })],
      })]],
    }), new Script({
      type: 'change_to_some_shape',
      params: [new Script({
        type: 'number',
        params: [frames],
      })],
    })]]),
  }],
  scenes: [{
    id: '7dwq',
    name: '장면 1',
  }],
  variables: [{
    name: '초시계',
    id: 'brih',
    visible: false,
    value: 0,
    variableType: 'timer',
    isCloud: false,
    isRealTime: false,
    cloudDate: false,
    object: null,
    x: -Number.MAX_VALUE,
    y: -Number.MAX_VALUE,
  }, {
    name: ' 대답 ',
    id: '1vu8',
    visible: false,
    value: 0,
    variableType: 'answer',
    isCloud: false,
    isRealTime: false,
    cloudDate: false,
    object: null,
    x: 0,
    y: 0,
  }],
  messages: [],
  functions: [],
  tables: [],
  speed: fps,
  interface: {
    menuWidth: 280,
    canvasWidth: 480,
    object: '7y0y',
  },
  expansionBlocks: [],
  aiUtilizeBlocks: [],
  hardwareLiteBlocks: [],
  externalModules: [],
  externalModulesLite: [],
  isPracticalCourse: false,
  name,
})

export default createVideoProject
