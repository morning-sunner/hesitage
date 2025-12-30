import { defineStore } from 'pinia'
import { ref } from 'vue'

interface ProvinceData {
  id: string
  name: string
  title: string
  map: string
  color: string
  projectCount: number
  worldHeritage: number
  worldHeritageList?: string[]
  description: string
  culturalBackground: string
  cities: string[]
  tags: Array<{ icon: string; text: string }>
  stats: Array<{ number: number; label: string }>
  heritage: Array<{ icon: string; name: string; description: string; category: string }>
  cityHotspots: Array<{
    name: string
    x: number
    y: number
    level: string
    heritage: number
    description: string
  }>
}

export const useHeritageStore = defineStore('heritage', () => {
  const currentProvince = ref('jiangsu')
  
  const provinceData: Record<string, ProvinceData> = {
    jiangsu: {
      id: 'jiangsu',
      name: '江苏',
      title: '江苏',
      map: '/figures/江苏.png',
      color: '#d4998f',
      projectCount: 146,
      worldHeritage: 3,
      worldHeritageList: ['昆曲', '苏州古典园林', '南京云锦', '苏州评弹', '苏州丝绸'],
      description:
        '江苏，地处中国东部长江三角腹心，是河湖交织、水网密布的江南水乡和鱼米之乡。江苏拥有众多的历史古迹和精深的文化遗产，昆曲艺术被誉为"百戏之祖"，苏州评弹委婉悠扬，南京云锦誉为禁城御用，苏州园林享誉海内外。',
      culturalBackground:
        '江苏文化底蕴深厚，是中华文明的重要发祥地之一。这里诞生了昆曲、苏州园林、南京云锦等世界级非物质文化遗产。吴文化、金陵文化、淮扬文化在此交融，形成了独特的江南文化景观。从古至今，江苏孕育了无数文人墨客，留下了丰富的文化遗产。',
      cities: ['南京', '苏州', '无锡', '扬州', '常州'],
      tags: [
        { icon: '/figures/icon-lantern.svg', text: '昆曲' },
        { icon: '/figures/icon-garden.svg', text: '园林' },
        { icon: '/figures/icon-silk.svg', text: '云锦' }
      ],
      stats: [
        { number: 42, label: '昆曲艺术' },
        { number: 38, label: '传统工艺' },
        { number: 31, label: '传统戏曲' },
        { number: 25, label: '传统医药' },
        { number: 35, label: '民间艺术' }
      ],
      heritage: [
        {
          icon: '/figures/icon-opera.svg',
          name: '昆曲',
          description: '中国最古老的剧种之一,被誉为"百戏之祖"',
          category: '传统戏剧'
        },
        {
          icon: '/figures/icon-garden.svg',
          name: '苏州园林',
          description: '中国古典园林的杰出代表',
          category: '建筑艺术'
        },
        {
          icon: '/figures/icon-silk.svg',
          name: '南京云锦',
          description: '中国传统丝织工艺的巅峰',
          category: '传统工艺'
        },
        {
          icon: '/figures/icon-art.svg',
          name: '苏绣',
          description: '中国四大名绣之一',
          category: '传统工艺'
        },
        {
          icon: '/figures/icon-lantern.svg',
          name: '秦淮灯会',
          description: '南京传统民俗活动',
          category: '民俗'
        }
      ],
      cityHotspots: [
        {
          name: '南京',
          x: 35,
          y: 45,
          level: 'high',
          heritage: 42,
          description:
            '南京拥有云锦、金箔、剪纸等42项非遗项目，是六朝古都和十朝都会'
        },
        {
          name: '苏州',
          x: 55,
          y: 50,
          level: 'high',
          heritage: 38,
          description: '苏州园林、昆曲、苏绣等38项非遗项目，被誉为"人间天堂"'
        },
        {
          name: '无锡',
          x: 50,
          y: 42,
          level: 'medium',
          heritage: 28,
          description: '惠山泥人、锡剧等28项非遗项目'
        },
        {
          name: '扬州',
          x: 42,
          y: 35,
          level: 'medium',
          heritage: 25,
          description: '扬州剪纸、漆器等25项非遗项目'
        },
        {
          name: '常州',
          x: 48,
          y: 48,
          level: 'low',
          heritage: 13,
          description: '常州梳篦、乱针绣等13项非遗项目'
        }
      ]
    },
    zhejiang: {
      id: 'zhejiang',
      name: '浙江',
      title: '浙江',
      map: '/figures/浙江.png',
      color: '#e8d5b7',
      projectCount: 217,
      worldHeritage: 4,
      worldHeritageList: ['西湖', '龙泉青瓷', '杭州丝绸', '越剧', '龙井茶制作'],
      description:
        '浙江，位于中国东南沿海，是江南水乡的典型代表。这里有西湖的秀美、钱塘江的壮阔、江南古镇的韵味。龙泉青瓷、越剧艺术、杭州丝绸、绍兴黄酒等非物质文化遗产丰富多彩，展现了浙江独特的江南文化魅力。',
      culturalBackground:
        '浙江是中国古代文明的发祥地之一，河姆渡文化、良渚文化见证了七千年的文明史。浙江人文荟萃，是中国书法、绘画、诗词的重要发源地。越剧、龙泉青瓷、西湖龙井茶等世界知名文化符号，展现了浙江深厚的文化底蕴和创新精神。',
      cities: ['杭州', '宁波', '绍兴', '嘉兴', '湖州'],
      tags: [
        { icon: '/figures/icon-tea.svg', text: '龙井茶' },
        { icon: '/figures/icon-wave.svg', text: '西湖' },
        { icon: '/figures/icon-opera.svg', text: '越剧' }
      ],
      stats: [
        { number: 58, label: '传统戏曲' },
        { number: 62, label: '传统工艺' },
        { number: 41, label: '民间文学' },
        { number: 31, label: '传统医药' },
        { number: 56, label: '民间艺术' }
      ],
      heritage: [
        {
          icon: '/figures/icon-tea.svg',
          name: '龙井茶制作',
          description: '中国十大名茶之首的制作工艺',
          category: '传统技艺'
        },
        {
          icon: '/figures/icon-opera.svg',
          name: '越剧',
          description: '中国第二大剧种',
          category: '传统戏剧'
        },
        {
          icon: '/figures/icon-pottery.svg',
          name: '龙泉青瓷',
          description: '世界陶瓷史上的璀璨明珠',
          category: '传统工艺'
        },
        {
          icon: '/figures/icon-yarn.svg',
          name: '杭州丝绸',
          description: '丝绸之路的起点',
          category: '传统工艺'
        },
        {
          icon: '/figures/icon-art.svg',
          name: '东阳木雕',
          description: '中国四大木雕之一',
          category: '传统工艺'
        }
      ],
      cityHotspots: [
        {
          name: '杭州',
          x: 65,
          y: 65,
          level: 'high',
          heritage: 45,
          description:
            '西湖龙井、丝绸、越剧等45项非遗项目，是人间天堂'
        },
        {
          name: '宁波',
          x: 75,
          y: 55,
          level: 'high',
          heritage: 38,
          description: '宁波金银彩绣、骨木镶嵌等38项非遗项目'
        },
        {
          name: '绍兴',
          x: 70,
          y: 62,
          level: 'medium',
          heritage: 32,
          description: '绍兴黄酒、越剧等32项非遗项目'
        },
        {
          name: '嘉兴',
          x: 60,
          y: 58,
          level: 'medium',
          heritage: 28,
          description: '嘉兴灶头画、硖石灯彩等28项非遗项目'
        },
        {
          name: '湖州',
          x: 58,
          y: 52,
          level: 'low',
          heritage: 24,
          description: '湖笔制作、含山蚕花等24项非遗项目'
        }
      ]
    },
    anhui: {
      id: 'anhui',
      name: '安徽',
      title: '安徽',
      map: '/figures/安徽.png',
      color: '#a8c8b8',
      projectCount: 88,
      worldHeritage: 2,
      worldHeritageList: ['黄梅戏', '宣纸制作', '徽墨', '徽派建筑', '歙砚'],
      description:
        '安徽，地处华东腹地，兼有南北文化特色。黄山奇松怪石、徽州古村落、宣纸徽墨等文化符号闻名遐迩。徽派建筑、徽剧、黄梅戏等非物质文化遗产，体现了安徽深厚的文化积淀。徽商文化与徽州三雕的精湛技艺，构筑了安徽独特的文化景观。',
      culturalBackground:
        '安徽是徽文化的发源地，徽州文化是中国三大地域文化之一。徽商、徽剧、徽菜、徽派建筑构成了独特的徽文化体系。黄梅戏作为中国五大戏曲剧种之一，享誉海内外。宣纸、徽墨、歙砚被誉为"文房四宝"，是中国传统文化的重要载体。',
      cities: ['合肥', '黄山', '芜湖', '安庆', '宣城'],
      tags: [
        { icon: '/figures/icon-mountain.svg', text: '黄山' },
        { icon: '/figures/icon-brush.svg', text: '徽墨' },
        { icon: '/figures/icon-building.svg', text: '徽派建筑' }
      ],
      stats: [
        { number: 22, label: '传统戏曲' },
        { number: 28, label: '传统工艺' },
        { number: 15, label: '民间文学' },
        { number: 12, label: '传统医药' },
        { number: 18, label: '民间艺术' }
      ],
      heritage: [
        {
          icon: '/figures/icon-brush.svg',
          name: '徽墨制作',
          description: '中国文房四宝之一的传统制作技艺',
          category: '传统工艺'
        },
        {
          icon: '/figures/icon-scroll.svg',
          name: '宣纸制作',
          description: '纸中之王的传统技艺',
          category: '传统工艺'
        },
        {
          icon: '/figures/icon-opera.svg',
          name: '黄梅戏',
          description: '中国五大戏曲剧种之一',
          category: '传统戏剧'
        },
        {
          icon: '/figures/icon-building.svg',
          name: '徽州三雕',
          description: '木雕、石雕、砖雕艺术',
          category: '传统工艺'
        },
        {
          icon: '/figures/icon-food.svg',
          name: '徽菜烹饪',
          description: '中国八大菜系之一',
          category: '传统技艺'
        }
      ],
      cityHotspots: [
        {
          name: '合肥',
          x: 25,
          y: 60,
          level: 'medium',
          heritage: 25,
          description: '庐剧、徽菜等25项非遗项目'
        },
        {
          name: '黄山',
          x: 35,
          y: 75,
          level: 'high',
          heritage: 28,
          description: '徽墨、歙砚等28项非遗项目'
        },
        {
          name: '芜湖',
          x: 32,
          y: 55,
          level: 'medium',
          heritage: 18,
          description: '芜湖铁画等18项非遗项目'
        },
        {
          name: '安庆',
          x: 20,
          y: 68,
          level: 'low',
          heritage: 12,
          description: '黄梅戏发源地，12项非遗项目'
        },
        {
          name: '宣城',
          x: 38,
          y: 68,
          level: 'low',
          heritage: 15,
          description: '宣纸制作等15项非遗项目'
        }
      ]
    },
    shanghai: {
      id: 'shanghai',
      name: '上海',
      title: '上海',
      map: '/figures/上海.png',
      color: '#d4998f',
      projectCount: 55,
      worldHeritage: 0,
      worldHeritageList: ['海派文化', '上海剪纸', '豫园灯会', '本帮菜烹饪', '沪剧'],
      description:
        '上海，位于长江入海口，是中国最大的经济中心城市。海派文化融合了江南传统文化与现代都市文明。上海剪纸、豫园灯会、本帮菜烹饪技艺等非遗项目，展现了上海特色的市民文化。作为国际大都市，上海在传承传统文化的同时，不断创新发展。',
      culturalBackground:
        '上海是海派文化的发源地，融合了吴越文化、江南文化和西方文化。作为近代中国的经济文化中心，上海孕育了独特的都市文化和市民文化。海派京剧、沪剧、越剧在此交相辉映，本帮菜、石库门、外滩建筑群构成了上海独特的文化符号。',
      cities: ['黄浦', '徐汇', '静安', '浦东', '闵行'],
      tags: [
        { icon: '/figures/icon-city.svg', text: '外滩' },
        { icon: '/figures/icon-culture.svg', text: '海派文化' },
        { icon: '/figures/icon-food.svg', text: '本帮菜' }
      ],
      stats: [
        { number: 12, label: '传统戏曲' },
        { number: 18, label: '传统工艺' },
        { number: 8, label: '民间文学' },
        { number: 7, label: '传统医药' },
        { number: 10, label: '民间艺术' }
      ],
      heritage: [
        {
          icon: '/figures/icon-opera.svg',
          name: '沪剧',
          description: '上海本地戏曲',
          category: '传统戏剧'
        },
        {
          icon: '/figures/icon-scissors.svg',
          name: '上海剪纸',
          description: '海派剪纸艺术',
          category: '民间艺术'
        },
        {
          icon: '/figures/icon-lantern.svg',
          name: '豫园灯会',
          description: '传统民俗活动',
          category: '民俗'
        },
        {
          icon: '/figures/icon-food.svg',
          name: '本帮菜',
          description: '上海传统烹饪技艺',
          category: '传统技艺'
        },
        {
          icon: '/figures/icon-art.svg',
          name: '海派玉雕',
          description: '上海玉雕技艺',
          category: '传统工艺'
        }
      ],
      cityHotspots: [
        {
          name: '黄浦区',
          x: 50,
          y: 50,
          level: 'high',
          heritage: 15,
          description: '豫园、外滩等15项非遗项目'
        },
        {
          name: '徐汇区',
          x: 45,
          y: 55,
          level: 'medium',
          heritage: 12,
          description: '海派文化聚集地，12项非遗项目'
        },
        {
          name: '静安区',
          x: 48,
          y: 48,
          level: 'medium',
          heritage: 10,
          description: '石库门建筑等10项非遗项目'
        }
      ]
    }
  }

  const setCurrentProvince = (provinceId: string) => {
    currentProvince.value = provinceId
  }

  const getProvinceData = (provinceId: string) => {
    return provinceData[provinceId] || provinceData.jiangsu
  }

  const getAllProvinces = () => {
    return Object.values(provinceData)
  }

  return {
    currentProvince,
    provinceData,
    setCurrentProvince,
    getProvinceData,
    getAllProvinces
  }
})
