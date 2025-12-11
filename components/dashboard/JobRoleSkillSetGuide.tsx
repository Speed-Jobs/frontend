'use client'

import { useState } from 'react'

interface SkillSetDetail {
  name: string
  description?: string
  technologies?: {
    category: string
    items: string[]
  }[]
}

interface JobRoleDetail {
  name: string
  definition: string
  composition: string[]
  skillSetDetails: Record<string, SkillSetDetail>
}

interface JobRole {
  name: string
  skillSets: string[]
  detail?: JobRoleDetail
}

interface CategoryData {
  category: string
  jobRoles: JobRole[]
}

interface SelectedTechnology {
  name: string
  category: string
}

// 직군별 상세 정보 데이터
const jobRoleDetails: Record<string, JobRoleDetail> = {
  'Software Development': {
    name: 'Software Development',
    definition: '다양한 프로그래밍 언어와 Industry 관련 지식과 경험을 활용하여, 고객 Needs에 맞는 소프트웨어/시스템/기능 구현',
    composition: ['Front-end Development', 'Back-end Development', 'Mobile Development'],
    skillSetDetails: {
      'Front-end Development': {
        name: 'Front-end Development',
        description: '사용자와 직접 상호작용하는 인터페이스 (UI) 디자인 및 동작을 구현하고, 지속적으로 사용자 경험(UX)을 개선',
        technologies: [
          {
            category: 'UI/UX 디자인 도구',
            items: ['Sketch', 'Adobe XD', 'Figma']
          },
          {
            category: '웹 프레임워크/라이브러리',
            items: ['React', 'Angular', 'Vue.js', 'Node.js', 'Next.js', 'Nust.js', 'jQuery']
          },
          {
            category: '웹 퍼블리싱',
            items: ['HTML', 'CSS', 'CSS 프레임워크 (Bootstrap, MaterialUI)', 'CSS 전처리기 (sass, scss, less)']
          }
        ]
      },
      'Back-end Development': {
        name: 'Back-end Development',
        description: '사용자가 UI를 통해 요청한 데이터를 처리하고, 서버에서 비즈니스 로직을 실행하여 적절한 응답을 생성. 데이터베이스와의 상호작용, API 연동, 보안, 사용자 인증 및 권한 관리, 파일 시스템 조작 등의 기능 구현',
        technologies: [
          {
            category: '웹 프레임워크',
            items: ['Spring', 'Spring Boot', 'Spring Cloud', 'Django', 'Flask', 'Nexcore J2EE', 'Nexcore .Net', 'ASP.NET']
          },
          {
            category: '데이터베이스',
            items: ['MySQL', 'PostgreSQL', 'Oracle', 'MS_SQL', 'MongoDB', 'MariaDB', 'Cassandra', 'Redis', 'Altibase']
          },
          {
            category: '데이터베이스 접근기술',
            items: ['JPA', 'mybatis', 'ibatis', 'JDBC', 'Entity Framework']
          },
          {
            category: '내외부 연동',
            items: ['(API) REST', 'SOAP', 'RPC', 'Web socket', '(메시징) Kafka', 'Rabbit', 'MSMQ']
          }
        ]
      },
      'Mobile Development': {
        name: 'Mobile Development',
        description: '모바일 기기 (iOS/Android)용 어플리케이션 디자인 및 개발. 어플리케이션 구축을 위한 기능 정의, 설계, 구현, 배포, 유지보수 (업데이트) 등을 수행',
        technologies: [
          {
            category: 'UI/UX 가이드',
            items: ['iOS (휴먼 인터페이스 지침)', 'Android (머티리얼 디자인)']
          },
          {
            category: 'Cross Platform 개발 프레임워크',
            items: ['React Native', 'Xamarin', 'Flutter']
          },
          {
            category: 'iOS 개발',
            items: ['Swift', 'Objective-C', 'Xcode', 'macOS', 'iOS SDK', 'TestFlight']
          },
          {
            category: 'Android 개발',
            items: ['Java', 'Kotlin', 'Android Studio', 'Android SDK', 'XML', 'SQLite', 'RESTful API', 'Firebase']
          }
        ]
      }
    }
  },
  'Factory AX Engineering': {
    name: 'Factory AX Engineering',
    definition: '다양한 제조 공정 프로세스, 자동화 장비 및 Digital Factory 구축/운영 지식을 활용하여 제조 AI 기반 Smart Factory 설계, 개발, 구축, 셋업 및 운영을 총괄하며 공정/물류 최적화 Leading, 궁극적으로 제조 AI기반 자율 제조 실현',
    composition: ['Simulation', '기구설계', '전장/제어'],
    skillSetDetails: {
      'Simulation': {
        name: 'Simulation',
        description: '생산 및 물류 프로세스 모델링 및 시뮬레이션을 통해 병목 현상 예측 및 개선 활동 수행. 다양한 시나리오를 통해 장비, 로봇, 공정간 상호작용을 테스트하여 생산계획 수립 및 비용 최적화. Smart Factory 생산성 및 유연성 확보를 위해 센서 데이터와 IoT 정보 연동하여 지속적인 모델 보정 및 실시간 운영을 지원',
        technologies: [
          {
            category: '시뮬레이션 및 모델',
            items: ['시뮬레이션 툴 (FlexSim/Siemens Tecnomatix Plant Simulation/AnyLogic 등)', '3D 모델링', 'GUI 설계']
          },
          {
            category: '프로그래밍/데이터 처리',
            items: ['프로그래밍 언어 (Python/MATLAB/R 등)', 'IoT·플랜트 데이터 연동 및 클라우드 처리']
          },
          {
            category: '데이터 분석/최적화',
            items: ['시뮬레이션 결과 분석', 'KPI 도출', '데이터 분석/최적화 기법']
          }
        ]
      },
      '기구설계': {
        name: '기구설계',
        description: '제조 현장의 자동화 로봇/설비 부품 및 구조를 설계/최적화하여 내구성과 생산 효율성 확보. 설계 신뢰성 확보를 위한 프로토타입 제작과 성능 검증, 생산 공정의 일관성 및 품질 향상을 위한 설비 표준화 작업 수행',
        technologies: [
          {
            category: '3D 설계',
            items: ['3D CAD/PLM: SolidWorks', 'CATIA']
          },
          {
            category: '해석/시뮬레이션',
            items: ['Ansys, Abaqus 활용한 유한요소해석(FEA)', '동역학 해석', '응력·내구 해석 (기구 움직임 정밀 분석, 설계 반영)']
          },
          {
            category: '소재 및 제조 공정 이해',
            items: ['금속, 플라스틱 등 다양한 신소재 특성 이해', '제조 공정 이해']
          },
          {
            category: '설계 표준화 및 규격 준수',
            items: ['기구설계 표준화', '국제규격 적용 (ISO, JIS 등)']
          }
        ]
      },
      '전장/제어': {
        name: '전장/제어',
        description: '공장 자동화 현장에서의 전기 회로 및 제어 시스템(센서, 액추에이터, 모터 등)을 설계/구축하고, PLC/SCADA/DCS 기반의 자동제어 프로그래밍 수행. 설비 간 통신/네트워크 관리, 데이터 수집 및 AL/ML기반 예측/최적화, 제조 SW 설계 및 시스템 통합을 통해 설비 자율 운영과 품질 검사 자동화를 실현',
        technologies: [
          {
            category: '제어 시스템 운영/프로그래밍',
            items: ['PLC/DCS/SCADA 시스템 운영', '프로그래밍 (Siemens, Rockwell, ABB 등)']
          },
          {
            category: '데이터 수집/예측 유지보수',
            items: ['실시간 설비 데이터 수집', 'IoT 센서 네트워크 활용', '데이터 기반 이상 진단', '예측 유지보수 시스템 구현']
          },
          {
            category: '모니터링',
            items: ['HMI 운영/원격 모니터링 솔루션 (WinCC OA, CIMPLICITY 등)']
          },
          {
            category: '안전/보안',
            items: ['전장 안전규격 적용 (KOSHA, IEC, NFPA 등)', 'OT 보안']
          }
        ]
      }
    }
  },
  'Solution Development': {
    name: 'Solution Development',
    definition: '다양한 Biz. Solution과 Industry 지식을 활용하여 기업 경영 활동을 지원하는 프로세스 설계 및 시스템 개발/운영',
    composition: ['ERP_FCM', 'ERP_SCM', 'ERP_HCM', 'ERP_T&E', 'Biz. Solution'],
    skillSetDetails: {
      'ERP_FCM': {
        name: 'ERP_FCM',
        description: '재무 영역(회계, 자금, 투자, 원가)의 비즈니스 프로세스 개선 및 이를 체계적으로 관리하기 위한 시스템 개발/운영',
        technologies: [
          {
            category: 'Biz. Knowledge',
            items: ['회계', '자금', '세법', '재무보고', '예산/원가 분석', 'Financial Process']
          },
          {
            category: 'Solution Skill',
            items: ['ERP FI, CO, TR, IM/PS 모듈 Configuration 및 Main Program 활용']
          },
          {
            category: 'Organization Structure-조직구조 이해 및 설계',
            items: ['Biz. Area', 'Company code', 'Cost Center 등 Configuration 방법']
          },
          {
            category: 'Data (기준 정보, Key Data, Trx.) 정의',
            items: ['CoA', 'Asset', 'Tax Code 등', 'ERP 재무 데이터 구조', '데이터 마이그레이션 전략 수립']
          }
        ]
      },
      'ERP_SCM': {
        name: 'ERP_SCM',
        description: '생산/제조, 구매/조달/자재관리, 판매/물류, 설비관리 프로세스 개선 및 Supply Chain Management 시스템 개발/운영',
        technologies: [
          {
            category: 'Biz. Knowledge',
            items: ['Order to cash', 'Procure to pay', 'Supply Chain', 'Plan to produce', '기업 End to End Process']
          },
          {
            category: 'Solution Skill',
            items: ['ERP MM (구매/자재관리)', 'SD', 'WM', 'TD', 'PP', 'PM', 'QM 모듈 Configuration 및 Program 활용']
          },
          {
            category: 'Organization Structure-조직구조 이해 및 설계',
            items: ['Plant', 'Storage location', 'Sales / Purchase Org. 등 Configuration 방법']
          },
          {
            category: 'Data (기준 정보, Key Data, Trx.) 정의',
            items: ['Vendor', 'Customer', 'Material', 'Product', 'BOM 등', 'SC Data 구조', '데이터 마이그레이션 전략 수립']
          }
        ]
      },
      'ERP_HCM': {
        name: 'ERP_HCM',
        description: '인사행정, 조직/인력관리, 근태/보상제도 구축 등의 비즈니스 프로세스 개선 및 관련 정책/법규/제도 환경 변화에 신속하게 대응할 수 있는 시스템 개발/운영',
        technologies: [
          {
            category: 'Biz. Knowledge',
            items: ['채용', '입사', '인사/조직', '급여/보상', '평가', '복리후생', '퇴직 등 Hire to Retire 전 과정 이해']
          },
          {
            category: 'Solution Skill',
            items: ['SAP HR', 'Success Factor', 'Workday', 'Web Cloud', 'e-hr 등 시스템 이해']
          },
          {
            category: 'Data (기준 정보, Key Data, Trx.) 정의',
            items: ['인사/조직 정보', '평가/교육 등', 'HR Data 구조', 'HR 이력 데이터 관리 방법/기준', '데이터 마이그레이션 전략 수립 방법/절차']
          }
        ]
      },
      'ERP_T&E': {
        name: 'ERP_T&E',
        description: 'ERP 시스템 아키텍처 설계, 구축, 운영 최적화 수행. 데이터 분석 시스템 및 리포트 구현, 고객 요구사항에 맞는 프로그램 개발/운영 (ABAP, Cloud, I/F 등)',
        technologies: [
          {
            category: 'System Architecture',
            items: ['ERP Database, Application, Client 구성 설계 및 구축', 'On-Premise 및 Cloud 환경을 통한 성능 최적화', '고가용성 및 사용자 접근성 고려']
          },
          {
            category: 'Programming',
            items: ['요구사항 분석', '설계', '개발', '운영 역량', 'ABAP', 'Web', 'Cloud BTP', 'PO EAI 활용']
          },
          {
            category: 'Data 분석',
            items: ['ERP 데이터 추출', '수집', '분류', '리포팅 (시각화 포함)', '재무, 물류, 인사 관련 ERP 데이터 분석']
          },
          {
            category: '변경관리',
            items: ['S/W 패치', '프로그램 이력', '운영 이관 절차 수립 및 실행']
          }
        ]
      },
      'Biz. Solution': {
        name: 'Biz. Solution',
        description: '고객의 Biz. 목표 달성과 Value 향상을 위한 최적화된 비즈니스 프로세스 제공, 다양한 Biz. Solutions를 활용한 시스템/서비스 개발/도입/운영. 시장 및 기술 트렌드에 기반한 Digital Products와 Services 제공을 위해 Open-Source (Back-end/Front-end)를 활용한 범용 Solutions 개발/적용/운영',
        technologies: [
          {
            category: 'Biz. Solution',
            items: ['Digital Workplace (M365, AD, Mail, Approval, OnWorkplace, OKTA, Mobile Apps)', 'Salesforce 기반 CRM (BI Tableau 포함)', 'SCM', 'SRM', 'RPA 등 다양한 Biz. Solution 및 개념/기능']
          },
          {
            category: 'Tech. Solution',
            items: ['범용 Solution/Service 기획 (기능 추출)', '개발', '패키징', '운영']
          },
          {
            category: 'Solution Architecture',
            items: ['Cloud (SaaS, PaaS, IaaS) 및 SAP on-Premise 이해 및 활용', '기술 검토', 'PoC (Proof of Concept)', '개발 리딩']
          },
          {
            category: 'Database',
            items: ['SAP HANA DB', 'MS SQL', 'Oracle 등 각 DB 특징 및 장단점']
          }
        ]
      }
    }
  },
  'Cloud/Infra Engineering': {
    name: 'Cloud/Infra Engineering',
    definition: '인프라 시스템의 안정성, 효율성, 가용성 향상을 위해 아키텍처 기반 클라우드/네트워크/보안 인프라를 구축 및 운영',
    composition: ['System/Network Engineering', 'Middleware/Database Engineering', 'Data Center Engineering'],
    skillSetDetails: {
      'System/Network Engineering': {
        name: 'System/Network Engineering',
        description: 'On-Premise/Cloud 환경에서 System, Network 등의 전문 지식을 바탕으로 인프라 아키텍처 설계, 구축 등을 수행. 시스템 개발/배포, 구축/운영의 모든 단계를 가시화/자동화/최적화하여 효과적인 관리체계 구축',
        technologies: [
          {
            category: 'System Build/Management',
            items: ['요구사항 분석', '시스템 설계 (On-Premise, Cloud)', '제품 선정/구성', '시스템 구축', '자동화 (구축/운영)', '시스템 보안 적용', '시스템 검증/운영 이관', '정기 점검 (항목/절차)']
          },
          {
            category: 'Container Platform Build/Operation',
            items: ['플랫폼/서비스 아키텍처 설계', '계정/권한/접근제어 구성', '컨테이너 스토리지 설계 및 구축', '컨테이너 환경 규모/비용 산정', '컨테이너 환경 리소스 최적화', '컨테이너 환경 과금/미터링']
          },
          {
            category: 'Cloud Native Service Design/Operation',
            items: ['요구사항 정의 (기능 추출)', '설계 (Monolithic, MSA 등)', '개발/배포 (CI/CD, 배포 파이프라인, 테스트 자동화 등)', '운영 최적화/개선', '거버넌스 수립', 'CSP별 관리 시스템 구축']
          },
          {
            category: 'CSP-based Managed Service Planning/Operation',
            items: ['CSP별 Managed Service 이해 및 관리 기법', 'IT Service Management', 'Cloud Monitoring/성능 분석', '리소스 최적화', 'Cloud 자동화 운영 (IaC) 및 트렌드', 'Container/Kubernetes', 'Kubernetes Ecosystem']
          },
          {
            category: 'Network Build/Optimization',
            items: ['기본 네트워크 원리 (TCP/IP protocol, Packet, Security 등)', '스위칭/라우팅 기술 활용', '네트워크 아키텍처 설계/구축 (성능 검증/구성 등)', '네트워크 보안 설계/구현', 'SDN (Software-Defined Networking) 구축', '네트워크 진단/튜닝', '성능/용량 관리', 'Network Consulting']
          },
          {
            category: 'VDI Build/Operation',
            items: ['VDI 서비스 환경 (Citrix, VMware 등)', 'VDI 사용자 업무 환경 이해', 'Master Image 최적화', 'VDI Architecture', '사용자 변경관리', 'VDI 서비스 품질 관리']
          },
          {
            category: 'Monitoring',
            items: ['ITSM', '모니터링 시스템 구축', '모니터링 도구 개발/평가 (Service/Log/Request/Network/System/Application 등)', '모니터링 환경 구축', '모니터링 데이터 통합/분석', '이벤트/알람 전파 시스템 구현']
          }
        ]
      },
      'Middleware/Database Engineering': {
        name: 'Middleware/Database Engineering',
        description: 'Infra/Cloud와 Application 연동을 위해 Middleware를 구축하고, 주어진 환경 속에서 안정적인 Database 운영과 성능 향상을 위한 관리, 튜닝, 복구 등을 수행',
        technologies: [
          {
            category: 'Middleware 구축/관리',
            items: ['Middleware 솔루션 특성', '설계 및 운영 관리 방법론', '통합 웹 서비스 아키텍처 설계', 'Middleware 관리 자동화', '컨테이너 관리', 'DB 연동 기술 이해 및 활용', 'TCP/IP 네트워크 환경']
          },
          {
            category: 'Middleware 성능 및 용량 관리',
            items: ['모니터링 도구 활용 및 분석', 'Performance Tuning', 'MW HA/DR 설계']
          },
          {
            category: 'DB 구성/관리',
            items: ['DBMS 구성/운영/정책 수립', '리소스 용량 산정', '변경관리', '장애관리', '보안관리', '최적화', '성능 분석 및 관리', 'DBMS Cluster/HA 환경 운영', 'SQL Tuning']
          }
        ]
      },
      'Data Center Engineering': {
        name: 'Data Center Engineering',
        description: '고객의 서비스가 안정적으로 제공될 수 있도록 Data Center를 설계 및 지원하며, 고객의 요구사항에 따라 설비, 건축, 전기, 기계, 소방, 안전 등 최적의 환경 구축 및 관리, 증설 등을 수행',
        technologies: [
          {
            category: 'Data Center 동향 분석',
            items: ['국내외 DC 시장/기술 동향 분석']
          },
          {
            category: 'Data Center 요건 및 표준',
            items: ['Data Center 기능 정의/필수 요건', 'Data Center 가용성/효율성 이해', '국내외 인증']
          },
          {
            category: '고객 요구사항 분석',
            items: ['요구사항 분석 프로세스', '제안서 작성 (시나리오, 프로세스별 제안 방법 등)', '요구사항 도출 도구 활용 (Checklist, Interview/Workshop 등 분석 방법)']
          },
          {
            category: 'Data Center 설계/운영',
            items: ['Data Center 개념 설계', 'Data Center 아키텍처 설계', '전기/HVAC/보안/소방 설비 관련 지식', '설비/벤더 선정', 'Data Center 구축 프로세스/프로젝트 관리', '프로젝트 관리 (구축 비용 산정, 비용 항목 관리 등)', '변경관리 (변경/승인 프로세스, 작업 계획서 작성, 작업 이력 관리 도구 등)', 'Data Center 운영 환경 설비 지식', 'Capacity Planning', '운영 환경 장애 대응']
          },
          {
            category: 'Data Center 사업관리',
            items: ['공간 고객 유치', '계약 관리', '견학 지원', '외부 사업 수행']
          }
        ]
      }
    }
  },
  'Architect': {
    name: 'Architect',
    definition: '소프트웨어 공학 지식을 기반으로 고객의 비즈니스 요구사항을 분석하고 최적화된 IT 아키텍처를 설계/구축 및 성능 최적화 등을 Leading',
    composition: ['Software Architect', 'Data Architect', 'Infra Architect', 'AI Architect', 'Automation Architect'],
    skillSetDetails: {
      'Software Architect': {
        name: 'Software Architect',
        description: '소프트웨어 시스템의 기능, 성능, 보안 등의 각 품질 속성을 보장하고 소프트웨어를 구성하는 요소와 그 상호관계를 분석/설계하여 소프트웨어의 전체적인 구조를 체계화. 다양한 이해관계자의 요구사항을 반영하여 기술적 방향을 설정하고, 시스템 성능 최적화를 포함하여 안정적이고 확장 가능한 시스템 아키텍처를 수립',
        technologies: [
          {
            category: '소프트웨어 아키텍처 설계 및 문서화',
            items: ['요구사항 기반 소프트웨어 구조 설계', '명확한 아키텍처 문서 작성']
          },
          {
            category: '비기능 요구사항 관리 및 기술 부채 관리',
            items: ['성능, 보안, 확장성 등 비기능 요구사항 정의 및 관리', '원인 분석 및 최적화', '기술 부채 식별 및 개선 전략 수립']
          },
          {
            category: '소프트웨어 품질 관리 및 표준 준수 지원',
            items: ['코드 리뷰', '테스트 전략 수립', '표준 및 가이드라인 준수 지속적 관리']
          }
        ]
      },
      'Data Architect': {
        name: 'Data Architect',
        description: '조직의 데이터 전략을 수립하고, 보유한 데이터를 체계적이고 구조적으로 설계하여 데이터의 일관성, 품질 확보 및 데이터 구조 품질 검증. 데이터 표준을 수립하고 데이터 아키텍처 요구사항 분석 후, 이를 기반으로 데이터 거버넌스 수립을 통해 데이터 기반 의사결정 지원. DB 관점에서 성능저하 원인분석 및 성능 이슈 해결 수행',
        technologies: [
          {
            category: '데이터 표준 정의 및 기반 기술 활용',
            items: ['데이터 표준 및 데이터 표준화 정의', '데이터 모델링 표준 및 가이드 수립', '데이터 모델링 도구 활용', '메타데이터 관리 도구 및 데이터 품질 관리 도구 적용 및 활용']
          },
          {
            category: '데이터 아키텍처 설계',
            items: ['데이터 아키텍처 프레임워크 정의', '데이터 참조 모델 정의', '데이터 아키텍처 방향 수립', '데이터 아키텍처 설계·검증·실행 관리']
          },
          {
            category: '데이터 거버넌스 설계',
            items: ['체계적이고 일관된 데이터 관리 및 활용을 위한 관리 정책 및 가이드라인 수립', '데이터 관리 프로세스 수립', '관리 조직 및 Roles & Responsibilities (R&R) 정의']
          },
          {
            category: 'DB 성능 최적화',
            items: ['DBMS 성능 이슈 원인 분석', '관련 이슈 해결 및 최적화 활동 수행']
          }
        ]
      },
      'Infra Architect': {
        name: 'Infra Architect',
        description: '하드웨어, 미들웨어, 네트워크, 클라우드를 포함한 인프라를 설계 및 구성하여 모든 자원의 적합성과 신뢰성 있는 서비스를 제공할 수 있도록 체계화. 시스템 장애 대응, 고가용성 설계, 백업 및 복구 정책, DR (Disaster Recovery) 체계 등을 포함한 인프라 표준과 운영 절차를 수립',
        technologies: [
          {
            category: 'Infra 기반 기술',
            items: ['컴퓨팅, 스토리지, 네트워크, 보안, OS, DB, Container, DR 설계 및 구성']
          },
          {
            category: 'Cloud Native 기술',
            items: ['Public 및 Private Cloud 기반 오픈소스 솔루션 활용', 'CSP 제품군 특성 분석 및 적용 전략 수립 (Managed, Serverless)']
          },
          {
            category: 'System Architecture',
            items: ['고객 요구사항 기반 인프라 아키텍처 설계 및 평가', '가용성, 확장성, 보안, 성능을 고려한 선진화 계획 수립']
          },
          {
            category: '운영 자동화 및 SRE',
            items: ['Kubernetes, CI/CD, 모니터링, IaC를 포함한 운영 자동화 설계 및 구현', '장애 대응 자동화', '로그 분석', '인프라 성능 지표 수집 등 SRE 기반 운영 최적화']
          },
          {
            category: '성능 및 품질 관리',
            items: ['인프라 성능 분석 및 설계', '기술적·운영적 효율성 향상 계획 수립']
          }
        ]
      },
      'AI Architect': {
        name: 'AI Architect',
        description: 'AI 기반 시스템 구축에 필요한 전반적인 기술 요소를 폭넓게 이해하고, 고객의 요구사항을 충족하는 서비스 구현을 위해 데이터 정제, 모델 활용, Evaluation, Ops에 이르는 AI Pipeline을 종합적으로 분석 및 설계',
        technologies: [
          {
            category: 'Orchestration',
            items: ['Document Structuring', 'Data Chunking', 'Metadata Management', 'Workflow Frameworks (LangChain, TaskWeaver, AutoGPT 등)']
          },
          {
            category: 'Prompt Engineering',
            items: ['Prompt Design Methodologies (Chain-of-Thought, Few-shot Prompting 등)', 'Prompt Automation 및 Template Management Technology', 'Human-in-the-loop', 'Prompt Continuous Improvement Technology']
          },
          {
            category: 'VectorDB 및 검색기술',
            items: ['Vector Database Design 및 Operation (Pinecone, Milvus, Faiss 등)', 'RAG Implementation Technology', 'Semantic Search Engines (ElasticSearch, OpenSearch, AI Search 등)', 'Embedding Management 및 Optimization Technology']
          },
          {
            category: 'LLMOps',
            items: ['Model Serving & Deployment (TensorRT, Triton, vLLM, TGI 등)', 'Data Ingestion Pipeline 구축 및 관리', 'Data Preprocessing (Tokenization, Prompt Engineering 등)', 'Parallel Processing (Distributed training 및 inference)', 'GPU Resource Management 및 Fractionalization Technology']
          },
          {
            category: 'Fine-tuning & Optimization',
            items: ['Lightweight Fine-tuning Technologies (LoRA, QLoRA 등)', 'Prompt Tuning, P-Tuning', 'Quantization, Distillation 및 기타 Model Optimization Technologies', 'Hyperparameter Optimization (HPO) Technology']
          },
          {
            category: 'AI 윤리 및 신뢰성 (Trustworthy AI)',
            items: ['Bias Detection 및 Fairness Evaluation Technology', 'AI Evaluation Technology', 'Explainable AI (XAI) 및 Output Transparency Enhancement Technology', 'Content Moderation 및 Safety Management Technology', '개인정보 보호 기술 (Differential Privacy 등)']
          },
          {
            category: 'Agent 및 자동화',
            items: ['Multi-Agent Design Technology', 'Agentic AI Platform Design Technology', 'Autonomous Workflow Management Technology', 'Planning 및 Action Automation Technology']
          }
        ]
      },
      'Automation Architect': {
        name: 'Automation Architect',
        description: '생산성 극대화 및 물류 효율화/안정성 확보를 위해 공장 전체 레이아웃과 생산라인의 공간 배치를 분석/설계하여 설비 및 동선을 최적화. Smart Factory 구축을 위한 Digital Twin 기반의 설계 및 검증을 수행하며, 신규 설비 도입 및 라인 증설의 타당성 분석하고 IT-OT 통합 인프라 설계를 통해 공장 자동화 효율화/최적화를 확보하는 역할 수행',
        technologies: [
          {
            category: '설계 및 모델링 도구',
            items: ['CAD/CAE (AutoCAD, SolidWorks, Tecnomatix, CATIA 등)', 'Digital Twin Platform (3D 모델링, BIM, 시뮬레이션) 등']
          },
          {
            category: '시뮬레이션 및 최적화',
            items: ['생산·물류 시뮬레이션 소프트웨어 (FlexSim, AnyLogic 등)', '최적화 알고리즘 (공간, 동선, 설비 배치 자동화)', '데이터 분석', 'Lean Manufacturing 원칙 이해 등']
          },
          {
            category: '시각화 및 협업 도구 활용',
            items: ['VR/AR 시각화 및 협업툴 (설계 검토 및 공간 커뮤니케이션) 등']
          }
        ]
      }
    }
  },
  'Project Management': {
    name: 'Project Management',
    definition: '프로젝트 범위, 시간, 비용, 품질에 대한 수행 계획을 수립하고, 효율적인 자원 조달과 이슈/Risk 등의 관리를 통해 프로젝트 목표 달성',
    composition: ['Application PM', 'Infra PM', 'Solution PM', 'AI PM', 'Automation PM'],
    skillSetDetails: {
      'Application PM': {
        name: 'Application PM',
        description: '전체 프로젝트 프로세스를 리딩하여 고객 니즈 및 업무 효율성 향상을 위한 솔루션/시스템 제공. 목표 설정, 자원 배분, 실행, 리스크 예방 및 관리 포함',
        technologies: [
          {
            category: 'SDLC 프로세스',
            items: ['Waterfall', 'Prototype', 'Iterative', 'Agile 프로세스 등']
          }
        ]
      },
      'Infra PM': {
        name: 'Infra PM',
        description: '고객의 H/W, Network, Cloud 시스템 관련 기술 이슈 및 니즈 해결을 위한 프로젝트 목표 설정, 실행, 리스크 예방 및 관리 리딩',
        technologies: [
          {
            category: 'Infra Fundamental',
            items: ['Cloud Computing', 'Container Platform', 'Infra / Cloud Architecture 등']
          },
          {
            category: '제조 공정 Fundamental',
            items: ['제조 공정 프로세스', '공정/반송 장비', '자동화/지능화 Concept Design', 'Digital Factory 구현 등']
          },
          {
            category: 'Engineering Fundamental',
            items: ['자동화설비 (Conveyor, ASRS, AGV, AMR, OHT, Lifter, Transfer)', '제어시스템 (CIM, PLC, MCS)', '산업용 로봇', '생산라인설계(CAD)', 'Factory Infra (배관, 유틸리티, HVAC 시스템, 네트워크)', 'Safety (OHSA, 내진규정, 안전관리) 규정 등']
          }
        ]
      },
      'Solution PM': {
        name: 'Solution PM',
        description: 'ERP, HR Solution 등 상용 솔루션에 대한 지식과 경험을 바탕으로 고객 요구사항에 맞는 최적화된 기능/시스템 구축 프로젝트 리딩. 또는 시장 및 기술 트렌드를 기반으로 직접 기획한 Digital Products/Services 또는 계약 프로젝트와 통합하여 브랜드 관리, 판매/프로모션, 판매, 유지보수, 기술지원 등 Product Life Cycle 전반을 관리하는 역할 수행',
        technologies: [
          {
            category: 'Solution Knowledge',
            items: ['ERP', 'Groupware', 'HR Solution', 'CRM 등']
          },
          {
            category: 'PLM (Product Lifecycle Management)',
            items: ['제품/서비스 기획 (제품 로드맵 수립/관리, 요구사항 정의, 범위 및 우선순위 결정, 자원/일정/예산 관리)', '제품화', '마케팅 기획 (가격 정책 수립, 브로셔 등 프로모션 자료 작성)', '마케팅/프로모션 활동', '판매/유지보수', '기술지원']
          },
          {
            category: 'Solution Architecture',
            items: ['Cloud 및 On-premise 환경 이해', '아키텍처 설계', '기술 검토', 'PoC (Proof of Concept) 수행', '개발 리딩']
          }
        ]
      },
      'AI PM': {
        name: 'AI PM',
        description: 'AI 기술을 활용하여 고객 니즈 및 이슈 해결 방안 제안. 프로젝트 관리 역량(목표 설정, 자원 배분, 리스크 관리) 및 기술 역량(AI 개발 프로세스 이해, Agentic Systems, 최신 기술 트렌드 분석, AI 적용 방법의 장단점 파악)을 바탕으로 전체 프로젝트 프로세스 리딩',
        technologies: [
          {
            category: 'Development Process and Methodologies',
            items: ['Agile Process', 'Iterative Process', 'Prototype Process']
          },
          {
            category: 'AI Tool Utilization',
            items: ['AI Literacy', '다양한 AI Tools 활용', 'AI Trends 이해 (기본 AI 지식, 최신 트렌드 파악, 실무 도구 활용 역량)']
          },
          {
            category: 'Agent and System Understanding',
            items: ['MCP (Multi-Agent System) 이해', 'Agentic Systems 이해', 'Agent 관련 Frameworks 특징 및 장단점 파악 (langchain, langgraph, langmem, code interpreter, autogen, autogpt, manus, n8n 등)', 'AI Architect 역할 이해']
          }
        ]
      },
      'Automation PM': {
        name: 'Automation PM',
        description: '제조 자동화 프로젝트의 목표/일정/비용/품질/리스크/성과를 종합 관리하고, 고객, 파트너, 내부 조직 등 이해관계자와의 커뮤니케이션을 통해 프로젝트 목표 달성. 신기술/신사업 기획 및 파일럿 운영을 통해 고객 생산성 향상 및 운영 효율성 리딩',
        technologies: [
          {
            category: 'TBM Operation and On-site Safety Management Leadership',
            items: ['TBM (Total Productive Maintenance) 운영 및 Safety 관련 규정 준수 관리 (KOSHA, OHSA, 내부 규정, 일반 안전관리 등)', '작업 허가제 관리', '사고 예방 문화 조성']
          },
          {
            category: 'On-site Process/Commissioning Management',
            items: ['설치/시운전 단계 관리 (FAT/SAT 수행 포함)', 'Line Balancing 원칙 이해']
          },
          {
            category: 'Automation/Control/AI Technology Understanding',
            items: ['자동화 설비 (Conveyor, ASRS, AGV, AMR, OHT, Lifter, Transfer 등) 및 설비 지능화', '설비 OT (Operational Technology)', '제어시스템 (CIM, PLC 등)', '산업용 로봇']
          }
        ]
      }
    }
  },
  'Quality Management': {
    name: 'Quality Management',
    definition: '사업 추진 과정의 Risk를 선제적으로 예방 및 관리하고, 업계 최고 수준의 품질을 제공하기 위한 프로세스/방법론 정립 및 실행',
    composition: ['PMO', 'Quality Engineering', 'Offshoring Service Professional'],
    skillSetDetails: {
      'PMO': {
        name: 'PMO',
        description: '사전 영업 단계부터 프로젝트 종료까지 전 단계의 Risk와 이슈의 사전 예방과 통제, 문제해결 지원하고 이를 위한 상시 모니터링 등을 수행',
        technologies: [
          {
            category: '영업 Risk 검토/관리',
            items: ['RFP/제안서 / 계약 독소조항 검토', 'Delivery Risk review (범위/역량/기간 등)', '규모 산정']
          },
          {
            category: '계약 협상',
            items: ['계약서 독소조항 검토', '협상 전략 수립', '對고객 협상', '계약서 부속 서류 (SOW 등) 작성 지원']
          },
          {
            category: '사업수행 Risk 진단 및 관리',
            items: ['범위/원가/품질 등 프로젝트 관리 요소 검토', 'Risk 식별', '생산성 분석']
          },
          {
            category: '분쟁 해결',
            items: ['Issue 분석 및 Fact Finding', 'Root Cause 파악', 'Issue 해결 전략 수립', '이해관계자 협상']
          },
          {
            category: 'RM 제도/프로세스 기획',
            items: ['전사 RM 프로세스 설계 및 운영', '전사 프로젝트 손익(O/R, U/R) 관리']
          }
        ]
      },
      'Quality Engineering': {
        name: 'Quality Engineering',
        description: '일관성 있는 제품/서비스 품질 유지를 위한 품질 보증 및 관리 활동을 수행하며, 개발/운영/관리방법 등의 표준 프로세스를 개발 및 안내하고 현업 내재화를 지원. IT 서비스 관리 거버넌스를 정의하고 품질 심사를 수행',
        technologies: [
          {
            category: 'SW Delivery 체계 고도화',
            items: ['방법론 / Delivery 기법 개발 및 적용', 'Agile Practice Coaching', 'DevOps 진단/적용']
          },
          {
            category: 'IT서비스 Governance',
            items: ['ITSM 프로세스', 'IT서비스 규정/가이드', '국제 인증']
          },
          {
            category: '품질점검/Audit',
            items: ['품질 원칙 / 계획', '품질감리 / 품질진단 / Audit']
          },
          {
            category: '장애관리 프로세스',
            items: ['인지, 전파, 해결', '장애 원인 분석/재발방지 프로세스', '장애 추세 분석']
          },
          {
            category: '테스트 전략/설계',
            items: ['테스트 전략/계획 수립', '테스트 활동 / 품질점검', '테스트 자동화']
          }
        ]
      },
      'Offshoring Service Professional': {
        name: 'Offshoring Service Professional',
        description: 'Global Delivery 체계 활용, IT 서비스 제공 관점에서 조직과 고객(사용자)의 목표, 프로세스, 요구사항 등을 이해/분석하여 Document 기반 업무 프로세스 실행과 Offshoring 협업체계를 L/H/C하고, 프로젝트 생산성 및 고객 만족도 제고, 산출물 품질 관리를 위한 현장(Onshore)와 해외(Offshore) 간 Communication을 지원',
        technologies: [
          {
            category: 'Offshoring Utilization Process Standardization',
            items: ['AGS 활용 이슈 도출', '개선안 도출', '프로세스 설계/실행/개선 및 전사 확산']
          },
          {
            category: 'Requirements Gathering/Evaluation',
            items: ['회사 업무/개발 프로세스 이해', 'Software Engineering 지식', '고객 요구사항 분석', 'Meeting 운영 및 Interview 역량', '요구사항 문서화 지원 (설계 문서 작성, 한영 번역 등)']
          },
          {
            category: 'Project Planning',
            items: ['프로젝트 관리 방법론', '프로젝트 생명주기 이해', 'PM과의 협업 및 지원', '자원 배분', '프로젝트 Risk 관리']
          },
          {
            category: 'Project Progress Tracking and Update',
            items: ['Agile & Scrum 방법론 활용', '정기 Meeting 운영', 'Task 관리', '프로젝트 변경 요구사항 확인 및 관리', '프로젝트 관리 및 추적 Tool 활용', '진척 보고', '인력 평가 및 교육']
          },
          {
            category: 'Deliverable Review/Test',
            items: ['IT 관련 지식 (DB, Network, Security 등)', 'Design', '프로그래밍 역량 (Coding 및 Source Review)', 'Testing 및 Debugging']
          },
          {
            category: 'Communication Support',
            items: ['언어 역량 (영어 및 기타 외국어 Communication 지원)', '대상 국가의 언어 및 문화 이해']
          }
        ]
      }
    }
  },
  'AI': {
    name: 'AI',
    definition: 'AI 기술을 기반으로 고객의 프로세스와 업무를 분석하여 고객의 Digital 역량과 경쟁력을 강화하는 서비스를 개발하는 역할을 수행',
    composition: ['AI/Data Development', 'Generative AI Development', 'Physical AI Development'],
    skillSetDetails: {
      'AI/Data Development': {
        name: 'AI/Data Development',
        description: 'AI 및 데이터 기술을 활용한 소프트웨어 및 시스템 개발. 데이터 수집, 저장, 처리, 분석(예측, 분류, 클러스터링 등)을 통한 인사이트 도출. AI Ops 및 MLOps 관련 기술 구현',
        technologies: [
          {
            category: 'AI/데이터 기반 아키텍처 정의',
            items: ['다양한 AI 워크로드와 멀티모달 처리(텍스트(NLP), 이미지(CV) 등)를 유연하게 지원하는 아키텍처 설계', '생성형 AI와 전통적인 머신러닝 모델(분류, 예측 등) 통합 전략 수립']
          },
          {
            category: 'LLM 기반 데이터 파이프라인 구성',
            items: ['수집부터 벡터 임베딩, 저장, 서비스 연계까지의 전체 데이터 플로우 설계', '대규모 병렬 처리 및 Fractional GPU 환경을 고려한 확장 가능한 구조 설계']
          },
          {
            category: 'AI 학습/서빙 인프라 설계',
            items: ['모델 학습, 튜닝, 서빙에 필요한 MLOps 플랫폼 및 리소스 구조 설계', 'SageMaker, Azure ML, Vertex AI 등 클라우드 서비스 활용을 통한 확장성 설계']
          },
          {
            category: '데이터 플랫폼 통합 아키텍처 구성',
            items: ['AI 파이프라인과의 연계를 고려한 통합 데이터 플랫폼 아키텍처 설계']
          }
        ]
      },
      'Generative AI Development': {
        name: 'Generative AI Development',
        description: 'Generative AI 파이프라인 전반 구현. LLM을 위한 데이터 처리부터 VectorDB 활용, Orchestration, 복잡한 Agent 개발까지. 관련 서비스 개발',
        technologies: [
          {
            category: 'LLM 기반 아키텍처 설계',
            items: ['모델 선택, Fine-tuning, Embedding 전략 수립 및 Multi-Modal 연계 설계', '지속 가능한 모델 운영을 위한 벤치마킹 및 테스트 설계']
          },
          {
            category: 'Prompt Engineering 및 체이닝 설계',
            items: ['LangChain, CoT 등 체이닝 기법과 DSPy를 활용한 프롬프트 최적화를 통해 LLM 워크플로우 설계']
          },
          {
            category: 'RAG 및 AI Orchestration 설계',
            items: ['문서 구조화, 메타데이터 관리, 벡터 검색 기반 검색형 QA 시스템 설계', 'LangGraph 기반의 Task 흐름 중심 Orchestration 및 역할 기반 멀티 에이전트 구성']
          },
          {
            category: 'VectorDB 및 검색 인프라 구성',
            items: ['Milvus, Qdrant, Weaviate 등 주요 벡터 DB와 OpenSearch, Azure AI Search 등 CSP 기반 벡터 검색 서비스를 활용한 RAG 구조 설계']
          }
        ]
      },
      'Physical AI Development': {
        name: 'Physical AI Development',
        description: '지능형 물리 시스템(로봇, 제조 장비 등)을 위한 AI 제어 모델 개발 및 로봇 동작 및 Task Learning 적용. Digital Twin과 Simulation을 활용한 실제 물리 환경의 정밀 제어 및 다양한 센서로부터 수집된 멀티모달 신호(비전, 오디오, 햅틱 등) 통합을 통한 고급 제어 시스템 구현. Tele-Operation, 자율주행, 상호작용 기반의 지능형 서비스 로봇 기술 개발',
        technologies: [
          {
            category: 'AI 기반 제어 및 알고리즘',
            items: ['강화학습 및 모방학습 등 AI 기반 제어 알고리즘 이해 및 적용', 'PyTorch, TensorFlow 등 AI 프레임워크 경험', '실제 물리 세계 적용을 위한 딥러닝 및 강화학습 모델 개발(프레임워크 활용)']
          },
          {
            category: '로봇 및 임베디드 시스템 프로그래밍',
            items: ['ROS(Robot Operating System), C/C++, Python 등을 활용한 로봇 및 임베디드 시스템 프로그래밍', '실시간 제어 역량']
          },
          {
            category: '시뮬레이션 및 하드웨어 연동',
            items: ['NVIDIA Isaac Sim, MuJoCo, Unity 등을 활용한 로봇 시뮬레이션', '실제 하드웨어 연동 역량']
          },
          {
            category: 'HW/SW 통합 및 문제 해결',
            items: ['실제 물리 환경에서의 디버깅', 'HW/SW 통합 관련 문제 해결 역량']
          }
        ]
      }
    }
  },
  '정보보호': {
    name: '정보보호',
    definition: '기업의 정보자산을 보호하기 위해 보안 전략/정책 수립, 제반 인프라 구축/운영, 위협 탐지/대응, Risk 진단 및 Compliance 관리 등을 수행',
    composition: ['보안 Governance / Compliance', '보안 진단/Consulting', '보안 Solution Service'],
    skillSetDetails: {
      '보안 Governance / Compliance': {
        name: '보안 Governance / Compliance',
        description: '보안관리 수준 개선 및 사업 수행을 지원하기 위한 보안 전략, 정책 수립, Biz. 보안성 검토/가이드. 보안 규제 및 감사 대응, 보안 거버넌스 체계 확립 등 전사적 보안 관리와 구성원 대상 보안 인식 제고 활동 수행',
        technologies: [
          {
            category: '보안 거버넌스 체계',
            items: ['보안 운영 프로세스 수립', '의사결정 구조 및 역할 정의', 'AI 윤리/책임성 원칙 반영 등']
          }
        ]
      },
      '보안 진단/Consulting': {
        name: '보안 진단/Consulting',
        description: '보안 취약점 진단 및 모의 해킹 등 다양한 점검 활동을 통해 위험 요소를 식별하고 개선 과제 도출을 수행. 시장/환경 분석을 기반으로 보안 사업을 기획하고, 보안설계/리스크분석/신기술 검토 등 보안 전략 자문 수행. 정보보안 프로젝트 관리체계 수립, 기준 점검, 품질/일정/위험 관리 등을 수행',
        technologies: [
          {
            category: 'Security Business Planning',
            items: ['시장/환경 분석', '사업 전략 수립/모델링', '구현 계획 수립(구축/운영)']
          },
          {
            category: 'Security Design/Review',
            items: ['보안 설계 및 프레임워크 수립(시스템 보안, AI/Cloud/OT 보안, 개발 보안 등)', 'Biz. 보안 Risk 분석', '보안 대책 수립/가이드', '보안 기술 검토/검증(PoC)']
          },
          {
            category: 'Security Diagnosis/Audit',
            items: ['기술 진단(침투 테스트, IT 인프라 진단 등) 기법 및 Tool 활용', '위협 시나리오 분석(MITRE ATT&CK 기반 등)', '보안 관리 체계 이해', '진단/감사 프로세스 및 방법론 수립']
          },
          {
            category: 'Security PMO Execution',
            items: ['프로젝트 보안 이슈/Risk 통합 관리', '산출물 품질 검증', '관리 보고 및 의사결정 지원']
          }
        ]
      },
      '보안 Solution Service': {
        name: '보안 Solution Service',
        description: '최신 기술 트렌드를 반영한 네트워크/시스템/어플리케이션 전반에 걸친 보안솔루션을 설계/구축/운영 등의 업무 수행. 보안 위협을 상시 모니터링하고, 침해사고 및 이상 징후를 탐지하여 신속하게 분석 및 대응하며 추가 확산/피해차단, 재발 방지 대책 수립/실행',
        technologies: [
          {
            category: 'Security Architecture Design',
            items: ['네트워크/시스템/어플리케이션 전반의 통합 보안 구조 설계', 'Defense-in-Depth 원칙 적용', '표준화']
          },
          {
            category: 'Security Infrastructure Build/Operation',
            items: ['보안 솔루션 검토 및 선정', '설계/구축/운영 기술', '정책 관리', '자동화', '최적화']
          },
          {
            category: 'Data Security/Encryption',
            items: ['저장/전송/사용 중 데이터 암호화', '키 관리(KMS)', '접근 제어', '마스킹', '토큰화']
          },
          {
            category: 'Security Monitoring',
            items: ['실시간 이벤트/위협 탐지 및 대응', '악성코드/보안 로그 분석', '보안 모니터링 플랫폼 구축/운영']
          },
          {
            category: 'Incident Response',
            items: ['보안 사고 분석 및 대응', '복구 계획 수립', '재발 방지 대책 수립/실행']
          },
          {
            category: 'Information Leakage Control',
            items: ['SIEM 기반 이상 행위 모니터링 구축/운영', '이상 정보 유출 식별 및 조사']
          },
          {
            category: 'Security Threat Intelligence',
            items: ['사고 사례, 취약점, 공격 트렌드 이해', 'OSINT 활용', '디지털 포렌식', '패킷 분석']
          }
        ]
      }
    }
  },
  'Sales': {
    name: 'Sales',
    definition: '시장 동향 파악과 고객관계 구축/관리를 통해 자사에 유리한 사업 환경을 조성하고, 지속적으로 고객에게 서비스/제품을 판매하여 수익 창출',
    composition: ['[금융] 제1금융', '[금융] 제2금융', '[공공/Global] 공공', '[공공/Global] Global', '[제조] 대외', '[제조] 대내 Hi-Tech', '[제조] 대내 Process', '[B2C] 통신', '[B2C] 유통/물류/서비스', '[B2C] 미디어/콘텐츠'],
    skillSetDetails: {
      '[금융] 제1금융': {
        name: '[금융] 제1금융',
        description: '은행권(시중은행, 지방은행, 인터넷은행, 특수은행 등) Account 개발/관리',
        technologies: [
          {
            category: '주요 Account',
            items: ['하나은행', 'KB국민은행', '신한은행', '우리은행', '대구은행', 'KDB산업은행 등']
          }
        ]
      },
      '[금융] 제2금융': {
        name: '[금융] 제2금융',
        description: '은행을 제외한 증권/보험/카드/캐피탈 등 Account 개발/관리',
        technologies: [
          {
            category: '주요 Account',
            items: ['미래에셋증권', 'KB증권', '신한생명', '한화생명', '우리카드', 'SBI저축은행 등']
          }
        ]
      },
      '[제조] 대외': {
        name: '[제조] 대외',
        description: '그룹 제조 사업을 제외한 대외 제조 Account 개발/관리(철강/금속, 자동차/부품, 조선/중공업, 화학, 식음료 등)',
        technologies: [
          {
            category: '주요 Account',
            items: ['POSCO', 'SeAH스틸', 'HD현대중공업', '두산밥캣', '농심 등']
          }
        ]
      },
      '[제조] 대내 Hi-Tech': {
        name: '[제조] 대내 Hi-Tech',
        description: '그룹 반도체, 배터리, 바이오 등 Hi-Tech 산업 관련 Account 개발/관리',
        technologies: [
          {
            category: '주요 Account',
            items: ['SK하이닉스', 'SK이노베이션', 'SK온', 'SK바이오팜', 'SK바이오텍 등']
          }
        ]
      },
      '[제조] 대내 Process': {
        name: '[제조] 대내 Process',
        description: '그룹 Hi-Tech 제조를 제외한 에너지/화학, 소재, 건설 등 제조 Account 개발/관리',
        technologies: [
          {
            category: '주요 Account',
            items: ['SK가스', 'SK E&S', 'SKC', 'SK ecoplant 등']
          }
        ]
      },
      '[B2C] 통신': {
        name: '[B2C] 통신',
        description: '유선/무선 통신 서비스 관련 Account 개발/관리',
        technologies: [
          {
            category: '주요 Account',
            items: ['SK텔레콤', 'SK브로드밴드']
          }
        ]
      },
      '[B2C] 유통/물류/서비스': {
        name: '[B2C] 유통/물류/서비스',
        description: '백화점, 홈쇼핑, 마트/편의점, 물류, 운송, 헬스케어, 교육 등 Account 개발/관리',
        technologies: [
          {
            category: '주요 Account',
            items: ['SK매직', 'SK렌터카', '현대백화점', '현대홈쇼핑', 'NS홈쇼핑', 'CJ대한통운', '한진 등']
          }
        ]
      },
      '[B2C] 미디어/콘텐츠': {
        name: '[B2C] 미디어/콘텐츠',
        description: '포털, 지상파 방송사, 종합편성채널 사업자, 게임, 엔터테인먼트 등 Account 개발/관리',
        technologies: [
          {
            category: '주요 Account',
            items: ['네이버', '카카오', 'MBC', '채널A', '동아일보', '넥슨', '스마일게이트 등']
          }
        ]
      },
      '[공공/Global] 공공': {
        name: '[공공/Global] 공공',
        description: '중앙정부 및 지방정부가 통제/소유하는 철도, 전기, 가스, 수도, 도로 등 사업 및 국방 관련 Account 개발/관리',
        technologies: [
          {
            category: '주요 Account',
            items: ['조달청', '국민연금공단', '한국예탁결제원', '금융감독원', '관세청', '우정사업본부', '한국석유공사 등']
          }
        ]
      },
      '[공공/Global] Global': {
        name: '[공공/Global] Global',
        description: '미국, 중국, 일본, 유럽 등 해외 거점 신규 Account 개발/관리',
        technologies: [
          {
            category: '주요 거점',
            items: ['미국', '중국', '일본', '유럽 등']
          }
        ]
      }
    }
  },
  'Domain Expert': {
    name: 'Domain Expert',
    definition: '고객의 산업/업무 전문성을 바탕으로 리드 발굴 및 선제안을 통해 사업을 개발하고, 프로젝트 범위/산출물 등을 명확하게 정의하여 프로젝트의 안정적 수행을 지원',
    composition: ['금융 도메인', '제조 도메인', '공공 도메인', 'B2C 도메인'],
    skillSetDetails: {
      '금융 도메인': {
        name: '금융 도메인',
        description: '금융 산업의 업무 프로세스, 규제, 트렌드 등에 대한 전문 지식을 바탕으로 금융 고객의 비즈니스 요구사항을 이해하고 프로젝트를 지원',
        technologies: [
          {
            category: '도메인 지식',
            items: ['은행 업무 프로세스', '금융 규제 및 감독 체계', '금융 IT 트렌드', '핀테크', '디지털 뱅킹', '리스크 관리', '컴플라이언스 등']
          }
        ]
      },
      '제조 도메인': {
        name: '제조 도메인',
        description: '제조 산업의 생산 프로세스, 품질 관리, 공급망 관리 등에 대한 전문 지식을 바탕으로 제조 고객의 비즈니스 요구사항을 이해하고 프로젝트를 지원',
        technologies: [
          {
            category: '도메인 지식',
            items: ['생산 계획 및 관리', '품질 관리 체계', '공급망 관리(SCM)', '스마트 팩토리', '제조 실행 시스템(MES)', '공정 최적화', '설비 관리 등']
          }
        ]
      },
      '공공 도메인': {
        name: '공공 도메인',
        description: '공공 부문의 행정 프로세스, 정책, 예산 관리 등에 대한 전문 지식을 바탕으로 공공 고객의 비즈니스 요구사항을 이해하고 프로젝트를 지원',
        technologies: [
          {
            category: '도메인 지식',
            items: ['행정 프로세스', '정책 수립 및 집행', '예산 및 회계 관리', '전자정부', '공공 데이터 활용', '민원 처리 프로세스', '조달 및 계약 관리 등']
          }
        ]
      },
      'B2C 도메인': {
        name: 'B2C 도메인',
        description: 'B2C 산업의 고객 경험, 마케팅, 유통 채널 등에 대한 전문 지식을 바탕으로 B2C 고객의 비즈니스 요구사항을 이해하고 프로젝트를 지원',
        technologies: [
          {
            category: '도메인 지식',
            items: ['고객 경험 관리(CXM)', '디지털 마케팅', '전자상거래', '유통 채널 관리', '고객 관계 관리(CRM)', '콘텐츠 관리', '모바일 서비스 등']
          }
        ]
      }
    }
  },
  'Consulting': {
    name: 'Consulting',
    definition: '고객의 산업/시장/비즈니스 이해를 바탕으로 고객의 이슈를 파악하여 솔루션/서비스 등을 선제안하고, 이를 통해 신규 비즈니스 모델 및 사업기회를 창출',
    composition: ['ESG', 'SHE', 'ERP', 'SCM', 'CRM', 'AI'],
    skillSetDetails: {
      'ESG': {
        name: 'ESG',
        description: 'ESG 경영 프로세스 및 솔루션에 대한 전문성을 바탕으로 고객의 ESG 수준을 진단하고, 맞춤형 ESG 전략/이니셔티브 컨설팅, 신규 사업 발굴 등을 수행',
        technologies: [
          {
            category: 'ESG 기본 지식',
            items: ['기업 ESG 진단 방법론', '중대성(materiality) 평가 및 관리', '지속가능경영팀 보고 Framework', '온실가스 배출량 산정 (Scope 1, 2, 3) / 목표수립 (SBTi) 방법론', 'ESG 평가 (DJSI, CDP, MSCI, KCGS)', 'LCA (Life Cycle Assessment) 산정 방법론', 'ESG 규제/정책 (CBAM, 중대재해처벌법 등)', '공시 문항 (KESG, SASB 등)', 'Global ESG Initiatives (GRI, UNGC, TCFD) 등']
          },
          {
            category: 'NetZero',
            items: ['Global NetZero Initiatives (SBTI, CBAM, EU Battery, ETS 등)', 'Global NetZero 규제', 'Industry / Domain 별 공정 분석', '탄소 배출량 측정 (GHG Protocol)', '탄소 배출량 감축', '탄소 배출량 상쇄', 'NetZero 공급망 관리', '환경영향평가 등']
          },
          {
            category: 'ESG Data 분석',
            items: ['ESG Data 분류/축적 자동화 등']
          }
        ]
      },
      'SHE': {
        name: 'SHE',
        description: '고객의 SHE 성숙도 및 Digital 수준을 진단하여 Digital SHE 방향성 및 전략을 수립하고, 신규 맞춤형 SHE 솔루션/플랫폼을 제안하거나 기존 솔루션을 고도화. 현장 안전, 보건, 환경(SHE) 정책 수립/실행 및 시설/공정 안전 매뉴얼 및 비상 대응 체계 구축 자문 수행. 현장 및 자동화 설비의 안전성 평가, 위험 요인 분석, 안전 운영 정책 수립 및 교육 수행',
        technologies: [
          {
            category: 'SHE 관련 법규 이해',
            items: ['산업안전보건법', '국내외 안전보건경영 표준 및 지침 (ISO45001, KOSHA 등)', 'PSM 평가 기준 등', '안전: 소방법, 시설물안전법, 화학물질관리법, 화학물질의 등록 및 평가 등에 관한 법률, 고압가스 안전관리법, 위험물안전관리법, 연구실 안전환경 관리법 등', '건강: 안전보건관리규정, 건강관리규정, 식품위생법 등', '환경: 대기관리권역법, 화학물질관리법, 물환경보전법, 대기환경보전법, 폐기물관리법 등']
          },
          {
            category: 'SHE 진단',
            items: ['안전관리체계 이해', 'SHE 진단 방법론', '공정/설비별 작업 절차', '건설/공사안전 관리 기준', '고객 현장 사고 예방', 'Digital 기술 수준 진단', '작업 환경 측정 (소음, 화학물질 노출, 야간 작업 등)', '유해/위험 요인 파악 (위험물질/기계/기구 등 관련 지식) 등']
          },
          {
            category: 'SHE 거버넌스/전략수립',
            items: ['안전보건 방향성/목표/Framework 수립', '위험 요인별 제거/관리 방안 도출 등']
          },
          {
            category: 'Digital SHE 구축',
            items: ['SHE 표준 관리 체계/플랫폼 구축 (작업자, 기계, 재료, 환경, 작업 방법 등 관리 방안 포함)', '모니터링/감지 기술 (CCTV, 센서 등)', 'Digital 기술 (AI/Machine Learning, Cloud, 빅데이터, IoT, 자동화)', '안전사고 및 재해 데이터 분석', 'SHE 리포팅 (시각화 포함) 등']
          },
          {
            category: 'Safety Mgmt.',
            items: ['건설/산업안전(산업)기사 자격 보유']
          }
        ]
      },
      'ERP': {
        name: 'ERP',
        description: '고객의 비즈니스 환경 및 기술 현황을 분석하여 신규 프로세스 또는 기술의 적용 또는 도입을 제안하고, 이를 바탕으로 고객의 신규 ERP 시스템 구축 및 고도화 프로젝트를 지원',
        technologies: [
          {
            category: 'ERP 시스템/모듈 이해',
            items: ['FCM (FI 재무/회계, CO 관리회계, TR 자금관리, AP 채무관리)', 'HCM (HR 인사관리)', 'BC (Basis Component), XI (eXchange Infrastructure), BTP (Business Technology Platform), ABAP (SAP S/4HANA 등), BW (Business Warehouse)']
          },
          {
            category: 'ISP/PI Consulting',
            items: ['진단 Tool 설계 및 실행', '고객 비즈니스 혁신을 위한 중장기 IT 정보화 및 Digital Transformation 전략 수립', '고객 특성 및 요구사항 기반 IT Master Planning 수립', '기존 고객 ERP 시스템 개선 및 고도화 계획 수립', '업무 영역별(FCM/IT 등) 맞춤형 프로세스 개선', 'ERP 솔루션 기반 비즈니스 개선']
          },
          {
            category: 'ERP 시스템 구축',
            items: ['As-Is 분석', 'To-Be 설계 (프로세스)', '시스템 구현', '테스트/검증', 'Cut-Over 실행 방법론']
          },
          {
            category: 'Biz. Solution 기본',
            items: ['고객 요구사항 분석', 'Solution별 기능', 'Solution Architecture 설계 방법론', 'Solution별 정책']
          },
          {
            category: 'Biz. Knowledge 기본',
            items: ['재무회계', '관리회계', '자금관리', '인사관리', '관련 비즈니스 지식 및 프로세스']
          },
          {
            category: 'Digital 기술 이해',
            items: ['AI/Machine Learning', 'Chatbot/RPA', 'Bigdata 분석 및 시각화', 'Cloud', 'Automation', 'Security']
          }
        ]
      },
      'SCM': {
        name: 'SCM',
        description: '고객의 시장 환경, 공급망 운영 역량, 정보시스템 등을 분석하여 SCM 전략을 수립하고, 운영 프로세스 개선/최적화를 통해 고객의 비즈니스 혁신을 지원',
        technologies: [
          {
            category: 'SCM 전략 수립',
            items: ['SCM 성과 분석 및 개선 (프로세스 단계별 비용 및 리드타임 분석, 향후 개선 계획 수립 등)', 'SCM 전략 수립 (이익 극대화, 비용 최소화 등)', 'SCM 시스템 모니터링 및 개선', 'SCM 프로세스 개선']
          },
          {
            category: '시스템 구축 방법론',
            items: ['As-Is 분석', 'To-Be 설계', '시스템 구현', '테스트/검증', 'Cut-Over 실행 방법론']
          },
          {
            category: 'Biz. Knowledge',
            items: ['Value Chain 이해', '구매/자재관리/조달 (수요 예측 및 수요 관리, 재고 최적화, 공급 계획 등)', '생산 관리', '판매 관리 (S&OP Process)', '품질 관리 관련 비즈니스 지식', 'SCM 관련 규제 이해 (관세법 등)']
          },
          {
            category: 'Biz. Solution 기본',
            items: ['고객 요구사항 분석', 'Solution별 기능', 'Solution Architecture 설계 방법론', 'Solution별 정책']
          },
          {
            category: 'Digital 기술 이해',
            items: ['AI/Machine Learning', '데이터 분석 및 시각화', 'Automation/지능화']
          }
        ]
      },
      'CRM': {
        name: 'CRM',
        description: '고객의 잠재 고객 발굴 현황 및 Sales Pipeline을 진단하여 맞춤형 CRM 전략 및 Roadmap을 수립하고, 시스템/인프라 개선/고도화를 제안',
        technologies: [
          {
            category: 'CRM 전략 수립',
            items: ['판매(B2B, B2C 등) 및 마케팅 방법론/프로세스 이해', '내부 및 외부 고객 환경 분석', 'CRM 전략 Framework 수립', '고객 데이터 마이닝 (Customer Information Mining)', '고객 세분화', '고객 행동 분석', '고객 LTV 분석 (Lifetime Value)', '이벤트 관리 (Consumer Promotion)', 'CRM 성과 관리 체계 도출', '고객 활성화 계획/전략 수립 (멤버십, 로열티 프로그램 등)', '변화 관리 체계 수립']
          },
          {
            category: '고객 Data 통합 및 인프라 설계',
            items: ['고객 데이터 마트(Data Mart) / 데이터 웨어하우스(Data Warehouse) 구성/설계', '고객 정보 통합 계획 수립', '캠페인 성과 측정 계획 도출', '캠페인 파일럿 선정', '캠페인 시연 계획/실행']
          },
          {
            category: '시스템 구축 방법론',
            items: ['As-Is 분석', 'To-Be 설계', '시스템 구현', '테스트/검증', 'Cut-Over 실행 방법론']
          },
          {
            category: 'Biz. Solution 기본',
            items: ['고객 요구사항 분석', 'Solution별 기능', 'Solution Architecture 설계 방법론', 'Solution별 정책']
          },
          {
            category: 'Digital 기술 이해',
            items: ['AI', 'Bigdata 분석 및 시각화', 'Cloud']
          }
        ]
      },
      'AI': {
        name: 'AI',
        description: 'AI 관련 시장 및 기술에 대한 전문성을 바탕으로 고객의 프로세스 혁신을 위한 기술 제안부터 컨설팅까지 서비스 수행',
        technologies: [
          {
            category: 'AI Trend 파악',
            items: ['Generative AI 기술(학술 논문 포함) 이해', '서비스 트렌드', '경쟁사 트렌드']
          },
          {
            category: 'AI/Data 기본 지식',
            items: ['기본 통계', 'Natural Language Processing (NLP)', 'Computer Vision (Vision)', 'Machine Learning', 'Deep Learning', '강화학습', '생성모델', 'Speech recognition']
          },
          {
            category: 'Cloud Computing 기본 지식',
            items: ['AWS, AZURE, Google Cloud 등 주요 CSP 플랫폼 관련 지식']
          },
          {
            category: 'Process Analysis',
            items: ['Business Process Analysis', 'AI 적용 방법 도출', 'AI 기술 영향도 이해']
          },
          {
            category: '신규 사업/서비스 개발',
            items: ['아이디어 개발 (Idea canvas 활용 Brainstorming 및 Grouping 포함)', '사업 및 시장성 검토', '컨셉 생성 및 선정']
          },
          {
            category: 'Strategy Planning',
            items: ['AI 기반 Business 혁신 전략 수립', '실행 Roadmap 개발', 'AI 도입 기대 효과 및 Value Analysis 수행']
          }
        ]
      }
    }
  },
  'Biz. Supporting': {
    name: 'Biz. Supporting',
    definition: '경영 목표를 조기에 달성할 수 있도록 전략 수립과 경영층 의사결정을 지원하고, 효율적인 자원 활용 및 구성원의 성장을 돕는 제도/프로그램 운영',
    composition: ['Strategy Planning', 'New Biz. Development', 'Financial Management', 'Human Resource Management', 'Stakeholder Management', 'Governance & Public Management'],
    skillSetDetails: {
      'Strategy Planning': {
        name: 'Strategy Planning',
        description: '회사의 비전, 경영 전략 및 과제 수립, 경영관리 체계 개선 및 경영층 의사결정 지원, 조직별 사업성 점검 등을 수행',
        technologies: [
          {
            category: '전략기획',
            items: ['중장기 및 단기 기업 전략 및 목표 수립', '조직별 사업 전략 수립/검토']
          },
          {
            category: '사업환경분석',
            items: ['경영 환경 분석 기법 이해', 'ITS/DT 산업 동향 파악', '동종업계 경쟁사 동향 파악']
          },
          {
            category: 'Mgmt. Process 설계 및 운영',
            items: ['정기/비정기 경영 이슈 보고', '위원회 및 의사결정 기구 설계']
          },
          {
            category: '재무 목표 수립/관리',
            items: ['연간 재무 목표 수립', '조직별 재무 성과 검토 및 분석', '재무 예측 및 목표 수립 관리']
          },
          {
            category: '성과/투자관리',
            items: ['KPI 체계 설계 및 운영', '목표 수립 및 평가', 'Gap 분석', '투자 계획 수립', '투자 성과 측정 및 관리', 'Exit 처리', '투자 프로세스 설계', '투자사 성과 관리']
          },
          {
            category: '기업 환경분석 및 평가',
            items: ['거시 경영 환경, 산업, 시장 분석', 'ITS/DT/ESG 산업 동향 이해', '경쟁사 분석', '기업가치 측정', '평가 방법론 활용', '측정 모델 설계', 'Financial Simulation 및 Scenario Planning']
          },
          {
            category: 'Resource 관리',
            items: ['영업 활동 관련 모든 비용 산정 (인건비, 일반관리비, 투자비 등)', '비용 변동 요인 분석 및 개선']
          }
        ]
      },
      'New Biz. Development': {
        name: 'New Biz. Development',
        description: '국내외 시장 모니터링 및 특정 산업/고객/기업분석을 통해 새로운 비즈니스를 발굴하고, 전략적 제휴, Partnering, Investment, M&A 등을 수행',
        technologies: [
          {
            category: '금융 기본',
            items: ['금융시장', '투자자산 등']
          },
          {
            category: '사업환경분석',
            items: ['경영 환경 분석 기법', 'ITS/DT 산업 동향 파악', '동종업계 경쟁사 동향 파악 등']
          },
          {
            category: '기업분석',
            items: ['타사 제휴 모델 분석/벤치마킹', '시나리오 플래닝 기법', '기업가치평가(평가방법/적용/결과 해석) 등']
          },
          {
            category: '재무 타당성 분석 (Financial Model Simulation)',
            items: ['재무제표 해석', '재무 추정/모델링 기법 등']
          },
          {
            category: '업체발굴/소싱',
            items: ['업체 발굴 기준 및 방법 등']
          },
          {
            category: '전략적 제휴',
            items: ['제휴 모델 별 특징 및 분석', '검토 Framework (기준/ 고려사항 등)', '실행 프로세스 시뮬레이션 등']
          },
          {
            category: 'Deal 관련 법/규제',
            items: ['Deal 유형 (합병/분할/지분투자/인수/투자유치/JV 등)', '관계사간 법/규제 등']
          },
          {
            category: '계약서 검토',
            items: ['계약서 구성', '계약 목적 별 Key Terms 도출', '계약서 해석 등']
          }
        ]
      },
      'Financial Management': {
        name: 'Financial Management',
        description: '재무적인 정보를 투명하고 공정하게 제공함으로써, 회계/세법/자산관리 등의 재무 관련 경영 리스크를 효과적으로 관리',
        technologies: [
          {
            category: '재무',
            items: ['거시경제/금융 관련 법 및 평가 이해', '외환 구조 및 대응 관리', '현금 관리', '운영자본 관리', '퇴직연금 등']
          },
          {
            category: '재무회계',
            items: ['회계 정책/기준/결산 이해', '연결/별도 재무제표 작성', '매출/매출원가/판매비와 관리비 등 성과 지표 적정성 검토', '사업 수익성 평가 등']
          },
          {
            category: '관리회계',
            items: ['전사/조직별 재무 계획 수립', '수익 개선 전략 수립 및 관리', '핵심 수익 지표 수립 및 관리', '예산 계획 및 변경 수립 및 관리 등']
          },
          {
            category: '세무',
            items: ['세무 자문 및 정보 분석', '각종 세무 이벤트 대응', '국제거래 관련 세무 검토/신고', '법인세', '부가가치세', '원천징수', '기타 세무 등']
          }
        ]
      },
      'Human Resource Management': {
        name: 'Human Resource Management',
        description: '최적의 인재 선발을 통해 적재적소에 배치하고, 구성원이 최고의 인재로 성장하기 위한 교육, 평가, 보상 등의 제도와 프로그램, 업무 몰입 환경을 제공',
        technologies: [
          {
            category: '인사관리',
            items: ['조직 이해 (조직 특성/문화 등)', '조직 설계 이론', '내부 인사 관리 기준', '인사 운영 규정 (근로기준법, 근로법, 파견근로자보호법 등)', '인사 제도 설계 (채용/평가/보상/승진/전보 등)', '임금 관리 (임금 정의/규정, 소득세법, 4대보험 관련 규정 등) 등']
          },
          {
            category: '직무/역량 관리',
            items: ['직무 분류 체계 수립', '직무 분석 (DACUM)', '역량 모델링 (CBC)', '직무 관리', '구성원 Skill set 관리/분석 등']
          },
          {
            category: '인력육성',
            items: ['교육 체계 수립', '직무 교육 프로그램 개발/운영', '리더십/핵심인재/계층별 교육 프로그램 개발/운영', 'LMS/KMS 기획 및 운영', '교육 예산 기획/관리 (근로자학습계좌) 등']
          },
          {
            category: '강의/코칭',
            items: ['기술 및 비즈니스 노하우 콘텐츠 개발/강의 (BP 관리, 제안 전략 등)', '구성원 코칭 (제안/발표/PT 등 컨설팅 포함) 등']
          },
          {
            category: '노사관리',
            items: ['ER Leadership', '노사 협상 관리', '노사 관계 기획', 'ER 전략 체계 수립', '경영협의회 운영 등']
          },
          {
            category: '조직진단/개발',
            items: ['조직 개발 방법론', '문화 창조 방법론', '기업/조직 문화 진단 및 개선', '조직 개발 프로그램 기획/운영 등']
          },
          {
            category: '업무지원',
            items: ['복리후생 제도 설계/운영', '복지 시설 운영 관리', '시설/임대 관리', '자산 관리 등']
          },
          {
            category: 'SHE',
            items: ['SHE Governance 관리', '안전 기획/진단', '산업안전보건 관리', '중대재해처벌법 이해', '위험물 관리', '외부 인증/감사 대응', 'SHE 교육/훈련/캠페인 기획 및 운영', '안전 지원 시스템 운영', '안전사고 및 재해 데이터 분석 등']
          },
          {
            category: 'PI 전략 수립/실행',
            items: ['CEO PI 전략 기획', 'CEO PI 프로그램 운영 등']
          }
        ]
      },
      'Stakeholder Management': {
        name: 'Stakeholder Management',
        description: '제반 경영 활동에 걸친 법률/경영 Risk를 사전에 식별/예방하고, 이를 위한 전략적 외부 소싱, 공정거래/동반성장 준수, 공급망 ESG 관리, 소송/분쟁 대응 등을 수행',
        technologies: [
          {
            category: '회사 제반 법규',
            items: ['국내 사업 관련 법/제도 (개인정보보호법, 근로관계법, 경쟁법, 민법, 상법 등)', '해외 사업 관련 법/제도 (국제거래법, 영미법, GDPR, 해외 개인정보보호법, 해외 회사법, 해외 근로관계법 등)']
          },
          {
            category: '공정거래 (동반성장)',
            items: ['Legal Compliance Risk 관리', '공정거래 자율준수', '공정거래법 및 하도급법 관련 규정 준수', '해외 컴플라이언스 관리', '외부 사업 지원', '동반성장 실시 평가 대응']
          },
          {
            category: '분쟁/소송 대응',
            items: ['국내외 소송/중재 대응 및 관리', '각종 국내외 분쟁 및 협상 처리', '외부 전문가 협력 및 자원 활용']
          },
          {
            category: '지식재산',
            items: ['지식재산 정책', '지식재산권 (특허, 디자인권, 상표권, 저작권 등) 출원/등록 관리', '오픈소스 라이선스 관리', '직원 발명 제도 운영', '특허 분석 및 전략 수립', '해외 지식재산법 이해']
          },
          {
            category: '전략적 구매',
            items: ['구매 전략 수립', '구매 비용 관리', '원가 분석', '구매 프로세스/시스템 기획 및 관리 (표준화 및 효율화)', '구매 협상', '하도급/동반성장 협력법 준수', '공급업체 소싱 및 관리', '공급업체 평가 및 육성', '공급망 ESG 관리']
          },
          {
            category: '계약 체결/관리',
            items: ['계약서 작성', '계약 조건 및 계약서 검토', '계약 이행 확인', '계약 해석', '계약 관련 사항 협상', 'AP 관련 항목 검토/승인']
          },
          {
            category: '법무지원 (M&A 등)',
            items: ['각종 법률 이슈 지원', '국내외 M&A 지원']
          },
          {
            category: 'ESG경영',
            items: ['SV (Social Value) 측정', 'ESG Risk 관리', '지속가능경영 보고서 공시/평가 대응', '환경 경영 데이터 및 평가 관리 및 대응']
          }
        ]
      },
      'Governance & Public Management': {
        name: 'Governance & Public Management',
        description: '다양한 채널과 매체를 활용하여 산업 및 시장 분석, 고객의 니즈 파악, 법/제도/정책 변화에 대한 선제적 대응을 통해 회사의 매출과 브랜드 가치를 극대화하는 전략을 수립/실행',
        technologies: [
          {
            category: '정보수집/분석',
            items: ['전통 미디어/신규 미디어 정보 수집 방법', '전문가 활용 방법', '외부 동향 이해/분석 (국회, 정부, 지자체, 협회 등)', '인적 네트워크 확보/관리 (국회, 정부, 지자체, 협회 등)']
          },
          {
            category: 'CR 전략수립',
            items: ['정부 정책 및 규제 이해', 'CR 전략 수립']
          },
          {
            category: '대외 이슈 대응',
            items: ['비즈니스 인텔리전스 제공', '전통 미디어 이슈 대응', '신규 미디어 이슈 진단 및 대응', '외부 강의']
          },
          {
            category: '감사',
            items: ['감사 항목 식별 기법', '내부/외부 감사 기법 및 대응', '감사 관련 법규', '감사 면담 기법', '리스크 평가', '조직 심리']
          },
          {
            category: 'PR 전략수립',
            items: ['PR Framework 수립', 'PR 환경 분석에 적합한 통합 IMC 구성']
          },
          {
            category: '미디어 커뮤니케이션',
            items: ['PR Life Cycle 이해', 'PR 스토리 개발', '보도자료 작성', '신규 미디어 채널 운영/관리', '신규 미디어 콘텐츠 기획/제작', 'YouTube 영상 기획/제작', '인터뷰 및 기획 보도 대응']
          },
          {
            category: '마케팅 전략 수립',
            items: ['전략 수립 방법론 (STP 등)', '전략적 시장/고객 포지셔닝', '예산 편성', '전략적 차별화 계획 수립', 'Marketing Mix 이해 및 적용 (4P, 4C, 5 Forces 등)']
          },
          {
            category: '브랜드 마케팅',
            items: ['브랜드 전략 수립 (경쟁사 분석, 인터뷰/워크샵, 차별화 요소 및 핵심 가치, 비전/미션, 체계 수립)', '브랜드 아이덴티티 개발 (스토리, 네이밍, 로고, 슬로건)', '브랜드 가이드 개발 (로고, 타이포그래피, 컬러 등 시각 가이드라인)', '브랜드 캠페인 (콘텐츠 제작, 프로모션, 공동 마케팅, 스폰서십)', '브랜드 관리 (내재화, 모니터링, 검토, 보완)']
          },
          {
            category: '콘텐츠 마케팅',
            items: ['고객 퍼널 단계별 콘텐츠', '마케팅 채널별 콘텐츠 제작', '카피라이팅 원칙']
          },
          {
            category: '캠페인/프로모션',
            items: ['프로모션 마케팅 이해', '프로모션 마케팅 유형 (판촉, 다이렉트 마케팅, 광고, PR)', '상세 마케팅 목표/채널 설정', '메시지 개발', '캠페인/프로모션 실행 및 모니터링', '마케팅 평가/성과 분석 (성과 지표 관리, ROI 분석)']
          },
          {
            category: '서비스 Offering 기획/관리',
            items: ['사업 프로젝트 현황 분석', '서비스 Offering 기획 및 조정']
          },
          {
            category: '고객 의견/반응 분석',
            items: ['데이터 수집/획득 방법 (설문, 인터뷰 설계)', '기본 통계', '고객 데이터 분석']
          },
          {
            category: '가격 모델 수립 (Pricing Planning)',
            items: ['재무 분석', '목표 원가 산정', '손익 추정 및 투자 규모 산정', '가격 및 판촉 계획 수립/기획/판매 채널 관리', '서비스 제품 및 구매 관리']
          }
        ]
      }
    }
  }
}

// 공통 기술 스택
const commonTechnologies = {
  '프로그래밍 언어': ['Java', 'node.js', 'Python', 'C/C++', 'Go', 'ASP.NET', 'Perl', 'Ruby', 'C#', 'PHP', 'Visual Basic'],
  '버전 관리 도구': ['Git', 'Github', 'SVN', 'Bitbucket'],
  '협업 Tool': ['Jira', 'Confluence', 'Slack', 'Teams', 'Notion', 'Google Docs'],
  'AI 활용': ['AI Literacy / Collaboration 역량'],
  'Industry Knowledge': ['1/2금융', '대외 제조', '대내 Hi-Tech', '대내 Process', '통신', '유통/물류/서비스', '미디어/콘텐츠', '공공', 'Global']
}

// Factory AX Engineering 공통 기술 스택
const factoryAXCommonTechnologies = {
  'Factory AX 기본': ['제조 공정', '공정/반송 장비 자동화/지능화 Concept Design', 'Digital Factory 구축'],
  'AI 활용': ['AI Literacy / Collaboration 역량'],
  'Industry Knowledge': ['제조 대외', '제조 대내 Hi-Tech', '제조 대내 Process', 'Global']
}

// Solution Development 공통 기술 스택
const solutionDevelopmentCommonTechnologies = {
  'Biz. Solution 기본': ['고객 요구사항 분석', 'Solution별 기능', 'Solution Architecture 설계 방법론 활용', 'Solution별 정책', '프로그래밍 (ABAP, Java, node.js, C#, BTP)'],
  '시스템 구축 방법론': ['As-Is 분석', 'To-Be 설계', '시스템 구현', '테스트/검증', 'Cut-Over 방법론'],
  'AI 활용': ['AI Literacy / Collaboration 역량'],
  'Industry Knowledge': ['1/2금융', '대외 제조', '대내 Hi-Tech', '대내 Process', '통신', '유통/물류/서비스', '미디어/콘텐츠', '공공', 'Global']
}

// Cloud/Infra Engineering 공통 기술 스택
const cloudInfraCommonTechnologies = {
  'Cloud/Infra Basic Knowledge': ['Infra / Cloud Architecture (OS, Server, Storage, Network, Security, Interface, Database, DBMS, L4, Middleware 등)', 'Cost Simulation'],
  'Working Skill': ['Business Writing', 'Communication', 'Presentation', 'Collaboration', 'Coordination', 'Risk Management', 'Data Analysis'],
  'AI 활용': ['AI Literacy / Collaboration 역량'],
  'Industry Knowledge': ['1/2금융', '대외 제조', '대내 Hi-Tech', '대내 Process', '통신', '유통/물류/서비스', '미디어/콘텐츠', '공공', 'Global']
}

// Architect 공통 기술 스택
const architectCommonTechnologies = {
  '아키텍처 전략 및 기술 표준 수립/관리': ['전체 IT 시스템 아키텍처 전략 수립', '기술 표준 정의', '구현 가이드라인 수립 및 관리'],
  '아키텍처 설계 검토/기술 리스크 관리': ['프로젝트 단계별 아키텍처 설계 검토 및 승인', '잠재적 기술 리스크 식별 및 대응 방안 준비'],
  '이해관계자와의 협력 및 아키텍처 역량 확산': ['프로젝트 내부·외부 이해관계자와의 커뮤니케이션', '기술적 조언 제공', '아키텍처 역량 확산을 위한 교육 및 지원 활동 수행'],
  'AI 활용': ['AI Literacy / Collaboration 역량'],
  'Industry Knowledge': ['1/2금융', '대외 제조', '대내 Hi-Tech', '대내 Process', '통신', '유통/물류/서비스', '미디어/콘텐츠', '공공', 'Global 등']
}

// Project Management 공통 기술 스택
const projectManagementCommonTechnologies = {
  '개발/관리 방법론': ['SKPE-AL 1.1', 'SKPM 2.0', 'Agile / Scrum 등'],
  '프로젝트 계획 수립': [
    '범위 계획: 범위 기술서 (Scope Statement), WBS 작성 등',
    '일정 계획: 공수 산정 기법, 일정 관리 Tool (마일스톤, 간트차트, PJT Network Diagram), Critical Path 등',
    '예산 계획: 예산 관리 프로세스, 예산 산정, 원가 구성 등'
  ],
  '프로젝트 실행 및 통제': [
    '인력 관리: 인력계획 수립, Project Team Acquire / Develop / Manage 등',
    '외주 관리: 외주 계약 형태, 계약 유형 선정 방법, 하도급법 등 Compliance Issue',
    '진척 관리: 예산 통제, 기성고 분석 (Earned Value), 일정 단축기법 등',
    '변경 관리: 변경관리 프로세스, 통합 변경관리, 비용/일정/예산 통합 변경 영향도 평가 등'
  ],
  '위험 및 이슈 관리': [
    '위험/이슈관리 프로세스: 계획 수립, 식별, 정성적 위험분석, 정량적 위험분석, 대응 계획, 감시 및 통제',
    '위험 분석: 위험 노출도, Decision Tree Analysis, 기대 화폐 가치 (Expected Monetary Value), 민감도 분석, 전문가 판단 등',
    '위험 대응 계획: Negative (Avoid / Transfer / Mitigate / Acceptance), Positive (Exploit / Share / Enhance / Acceptance)',
    '위험 감시 및 통제: 위험 재평가, Risk Audit, Variance and Trend Analysis 등'
  ],
  '안전인증': [
    '프로젝트 해당 Site의 지역별 안전인증에 대한 검증: UL, CE, 자율안전인증, 전자파인증, 구조해석, NRTL, 전파인증 외',
    '자동화 설비의 안전인증 및 해당 Site 안전규정에 맞는 제작 및 부품 사용에 대한 검증 및 관리'
  ],
  '프로젝트 품질관리': [
    '품질관리 계획 수립: Cost-Benefit Analysis, 품질 비용 산정 (Cost of Quality), 품질통제 도구 활용 (Control Chart, Pareto Diagram, Fishbone Diagram 등), 품질관리계획, 프로세스 개선 활동, Quality Metrics, 품질 체크리스트 등',
    '품질 보증 수행: Quality Audits, Process Analysis 등',
    '품질통제: 품질통제 도구 (Control Chart, Pareto Diagram, Fishbone Diagram 등), Inspection / Review 등'
  ],
  'Soft Skill': ['Communication Skill', '변화 리더십 (Change Leadership)', '포용적 사고방식 (Inclusive Thinking)', 'Problem Solving', 'Presentation Skill', 'Speech', 'Biz. Writing 등'],
  'AI 활용': ['AI Literacy / Collaboration 역량', 'DAVIS (Delivery AI Agent & Virtual Intelligence Suite)'],
  'Industry Knowledge': ['대외 제조', '대내 Digital Factory/Hi-Tech', '유통/물류', '이차전지', '자동차', '전자', '반도체 등']
}

// Quality Management 공통 기술 스택
const qualityManagementCommonTechnologies = {
  '개발/관리 방법론': ['SKPE-UM2.0', 'SKPM 2.0 등'],
  'Working Skill': ['Business Writing', 'Communication', 'Presentation', 'Coordination', 'Collaboration', 'Risk Management (Risk 관리)', 'Data Analysis (데이터분석) 등'],
  'AI 활용': ['AI Literacy / Collaboration 역량'],
  'Industry Knowledge': ['1/2금융', '대외 제조', '대내 Hi-Tech', '대내 Process', '통신', '유통/물류', '미디어/콘텐츠', '공공', 'Global 등']
}

// AI 공통 기술 스택
const aiCommonTechnologies = {
  'AI 기반 서비스 기획 및 구조 설계': ['신규 서비스/시스템 아키텍처 요구사항 정의', '시장성 검토', 'PoC 방향 설정', '고객 Use Case 기반 AI 서비스 플로우 및 Agent 구성 전략 수립'],
  'Cloud/Container 기반 AI Infra 아키텍처 설계': ['Docker 및 Kubernetes 기반 배포/서빙 인프라 설계', '하이브리드 또는 멀티 클라우드 환경(AWS, Azure, Google Cloud 등) 기반 리소스 및 MLOps 구성 설계'],
  '개발 환경 및 프레임워크 구성': ['Python 기반 실험 및 서비스 환경 구성(FastAPI, Streamlit, LangChain 등 활용)', '데이터 파이프라인과 연계된 Pytorch 중심 엔지니어링 환경 설계']
}

// 정보보호 공통 기술 스택
const informationSecurityCommonTechnologies = {
  '보안 기본지식': ['시스템 보안(NW/서버/MW/DB/App./보안솔루션)', 'AI/Cloud/OT 보안', '시큐어코딩', '암호화/인증 등'],
  'Working skill': ['Business Writing', '커뮤니케이션', 'Presentation', 'Coordination', '협업', 'AI 활용', 'Risk 평가', '데이터 분석 등']
}

// Biz. Supporting 공통 기술 스택
const bizSupportingCommonTechnologies = {
  '당사 사업 이해': ['당사 사업 영역 및 전략 이해'],
  '재무/회계 기본 지식': ['재무제표 이해', '회계 원칙', '세무 기본 지식', '재무 분석 기법 등'],
  '업무 지원 시스템 이해': ['인사 시스템', '회계 시스템', '구매 시스템 등 업무 지원 시스템 이해'],
  'SKMS/4P 이해': ['SKMS/4P 체계 및 운영 방법 이해'],
  'Working Skill': ['Business Writing', 'Communication', 'Presentation', 'Collaboration', 'Coordination', 'Risk Management', 'Data Analysis'],
  'AI 활용': ['AI Literacy / Collaboration 역량'],
  'Industry Knowledge': ['1/2금융', '대외 제조', '대내 Hi-Tech', '대내 Process', '통신', '유통/물류/서비스', '미디어/콘텐츠', '공공', 'Global 등']
}

const jobRoleData: CategoryData[] = [
  {
    category: 'Tech 전문가',
    jobRoles: [
      {
        name: 'Software Development',
        skillSets: ['Front-end Development', 'Back-end Development', 'Mobile Development'],
        detail: jobRoleDetails['Software Development']
      },
      {
        name: 'Factory AX Engineering',
        skillSets: ['Simulation', '기구설계', '전장/제어'],
        detail: jobRoleDetails['Factory AX Engineering']
      },
      {
        name: 'Solution Development',
        skillSets: ['ERP_FCM', 'ERP_SCM', 'ERP_HCM', 'ERP_T&E', 'Biz. Solution'],
        detail: jobRoleDetails['Solution Development']
      },
      {
        name: 'Cloud/Infra Engineering',
        skillSets: ['System/Network Engineering', 'Middleware/Database Engineering', 'Data Center Engineering'],
        detail: jobRoleDetails['Cloud/Infra Engineering']
      },
      {
        name: 'Architect',
        skillSets: ['Software Architect', 'Data Architect', 'Infra Architect', 'AI Architect', 'Automation Architect'],
        detail: jobRoleDetails['Architect']
      },
      {
        name: 'Project Management',
        skillSets: ['Application PM', 'Infra PM', 'Solution PM', 'AI PM', 'Automation PM'],
        detail: jobRoleDetails['Project Management']
      },
      {
        name: 'Quality Management',
        skillSets: ['PMO', 'Quality Engineering', 'Offshoring Service Professional'],
        detail: jobRoleDetails['Quality Management']
      },
      {
        name: 'AI',
        skillSets: ['AI/Data Development', 'Generative AI Development', 'Physical AI Development'],
        detail: jobRoleDetails['AI']
      },
      {
        name: '정보보호',
        skillSets: ['보안 Governance / Compliance', '보안 진단/Consulting', '보안 Solution Service'],
        detail: jobRoleDetails['정보보호']
      }
    ]
  },
  {
    category: 'Biz. 전문가',
    jobRoles: [
      {
        name: 'Sales',
        skillSets: [
          '[금융] 제1금융',
          '[금융] 제2금융',
          '[공공/Global] 공공',
          '[공공/Global] Global',
          '[제조] 대외',
          '[제조] 대내 Hi-Tech',
          '[제조] 대내 Process',
          '[B2C] 통신',
          '[B2C] 유통/물류/서비스',
          '[B2C] 미디어/콘텐츠'
        ],
        detail: jobRoleDetails['Sales']
      },
      {
        name: 'Domain Expert',
        skillSets: ['금융 도메인', '제조 도메인', '공공 도메인', 'B2C 도메인'],
        detail: jobRoleDetails['Domain Expert']
      },
      {
        name: 'Consulting',
        skillSets: ['ESG', 'SHE', 'ERP', 'CRM', 'SCM', 'AI'],
        detail: jobRoleDetails['Consulting']
      }
    ]
  },
  {
    category: 'Biz. Supporting 전문가',
    jobRoles: [
      {
        name: 'Biz. Supporting',
        skillSets: [
          'Strategy Planning',
          'New Biz. Development',
          'Financial Management',
          'Human Resource Management',
          'Stakeholder Management',
          'Governance & Public Management'
        ],
        detail: jobRoleDetails['Biz. Supporting']
      }
    ]
  }
]

export default function JobRoleSkillSetGuide() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tech 전문가')
  const [selectedJobRole, setSelectedJobRole] = useState<string | null>(null)
  const [selectedSkillSet, setSelectedSkillSet] = useState<string | null>(null)
  const [selectedTechnology, setSelectedTechnology] = useState<SelectedTechnology | null>(null)

  const currentCategoryData = jobRoleData.find(cat => cat.category === selectedCategory)
  const selectedJobRoleDetail = selectedJobRole 
    ? currentCategoryData?.jobRoles.find(role => role.name === selectedJobRole)?.detail
    : null
  const selectedSkillSetDetail = selectedJobRoleDetail && selectedSkillSet
    ? selectedJobRoleDetail.skillSetDetails[selectedSkillSet]
    : null

  const handleJobRoleClick = (jobRoleName: string) => {
    if (selectedJobRole === jobRoleName) {
      setSelectedJobRole(null)
      setSelectedSkillSet(null)
    } else {
      setSelectedJobRole(jobRoleName)
      setSelectedSkillSet(null)
    }
  }

  const handleSkillSetClick = (skillSetName: string, jobRoleName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    // 해당 직무가 속한 직군 찾기
    const foundJobRole = currentCategoryData?.jobRoles.find(role => role.name === jobRoleName)
    
    if (selectedSkillSet === skillSetName && selectedJobRole === jobRoleName) {
      setSelectedSkillSet(null)
      setSelectedTechnology(null)
    } else {
      // 직군이 선택되지 않았거나 다른 직군이 선택된 경우, 해당 직군을 선택
      if (selectedJobRole !== jobRoleName) {
        setSelectedJobRole(jobRoleName)
      }
      setSelectedSkillSet(skillSetName)
      setSelectedTechnology(null)
    }
  }

  const handleTechnologyClick = (techName: string, category: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedTechnology?.name === techName && selectedTechnology?.category === category) {
      setSelectedTechnology(null)
    } else {
      setSelectedTechnology({ name: techName, category })
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* 탭 */}
      <div className="flex gap-2 mb-4 border-b border-gray-200 flex-shrink-0">
        {jobRoleData.map((category) => (
          <button
            key={category.category}
            onClick={() => {
              setSelectedCategory(category.category)
              setSelectedJobRole(null)
              setSelectedSkillSet(null)
              setSelectedTechnology(null)
            }}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              selectedCategory === category.category
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {category.category}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 flex gap-4 overflow-hidden">
        {/* 직무 목록 */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-2">
          <div className="space-y-3">
            {currentCategoryData?.jobRoles.map((jobRole) => (
              <div
                key={jobRole.name}
                onClick={() => {
                handleJobRoleClick(jobRole.name)
                setSelectedTechnology(null)
              }}
                className={`border rounded-lg px-4 py-3 bg-white cursor-pointer transition-all ${
                  selectedJobRole === jobRole.name
                    ? 'border-blue-500 shadow-md bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-shrink-0 min-w-[200px]">
                    <span className={`text-sm font-semibold ${
                      selectedJobRole === jobRole.name ? 'text-blue-700' : 'text-gray-900'
                    }`}>
                      {jobRole.name}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      ({jobRole.skillSets.length}개)
                    </span>
                  </div>
                  {selectedJobRole === jobRole.name && (
                    <span className="text-xs text-blue-600 font-medium">✓ 선택됨</span>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {jobRole.skillSets.map((skillSet, index) => (
                    <button
                      key={index}
                      onClick={(e) => handleSkillSetClick(skillSet, jobRole.name, e)}
                      className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                        selectedSkillSet === skillSet && selectedJobRole === jobRole.name
                          ? 'bg-blue-100 border-blue-400 text-blue-700 font-medium shadow-sm'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300'
                      }`}
                    >
                      {skillSet}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 상세 정보 패널 */}
        {(selectedJobRoleDetail || selectedSkillSetDetail || selectedTechnology) && (
          <div className="w-[500px] border-l border-gray-200 pl-4 overflow-y-auto flex-shrink-0">
            {selectedTechnology ? (
              // 기술 상세 정보
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedTechnology.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedTechnology.category}
                      {selectedSkillSetDetail && ` · ${selectedSkillSetDetail.name}`}
                      {selectedJobRoleDetail && ` · ${selectedJobRoleDetail.name}`}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedTechnology(null)}
                    className="text-gray-400 hover:text-gray-600 text-xl"
                  >
                    ×
                  </button>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">③</span>
                    <h4 className="text-sm font-bold text-gray-900">기술 상세 정보</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h5 className="text-xs font-semibold text-gray-700 mb-2">기술명</h5>
                      <p className="text-sm text-gray-900 font-medium">{selectedTechnology.name}</p>
                    </div>
                    
                    <div>
                      <h5 className="text-xs font-semibold text-gray-700 mb-2">카테고리</h5>
                      <p className="text-sm text-gray-700">{selectedTechnology.category}</p>
                    </div>

                    {selectedSkillSetDetail && (
                      <div>
                        <h5 className="text-xs font-semibold text-gray-700 mb-2">관련 직무</h5>
                        <p className="text-sm text-gray-700">{selectedSkillSetDetail.name}</p>
                      </div>
                    )}

                    {selectedJobRoleDetail && (
                      <div>
                        <h5 className="text-xs font-semibold text-gray-700 mb-2">관련 직군</h5>
                        <p className="text-sm text-gray-700">{selectedJobRoleDetail.name}</p>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <p className="text-xs text-gray-600 leading-relaxed">
                        이 기술은 <span className="font-semibold">{selectedTechnology.category}</span> 카테고리에 속하며, 
                        {selectedSkillSetDetail && ` ${selectedSkillSetDetail.name} 직무`}
                        {selectedJobRoleDetail && `와 ${selectedJobRoleDetail.name} 직군`}에서 사용됩니다.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 관련 기술들 */}
                {selectedSkillSetDetail?.technologies && (
                  <div className="mt-4">
                    <h5 className="text-xs font-semibold text-gray-700 mb-3">같은 카테고리의 다른 기술들</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedSkillSetDetail.technologies
                        .find(tech => tech.category === selectedTechnology.category)
                        ?.items.filter(item => item !== selectedTechnology.name)
                        .map((item, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-50 text-gray-700 border border-gray-200 rounded text-xs"
                          >
                            {item}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ) : selectedSkillSetDetail ? (
              // 직무(Skill Set) 상세 정보
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedSkillSetDetail.name}</h3>
                    {selectedJobRoleDetail && (
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedJobRoleDetail.name} 직군
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedSkillSet(null)
                      setSelectedTechnology(null)
                    }}
                    className="text-gray-400 hover:text-gray-600 text-xl"
                  >
                    ×
                  </button>
                </div>

                {/* 직무 개요 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">①</span>
                    <h4 className="text-sm font-bold text-gray-900">직무 개요</h4>
                  </div>

                  {/* 직무 정의 */}
                  {selectedSkillSetDetail.description && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h5 className="text-xs font-semibold text-gray-700 mb-2">| 직무 정의 (Job Definition)</h5>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {selectedSkillSetDetail.description}
                      </p>
                    </div>
                  )}

                  {/* 직무 구성 - 해당 직무가 속한 직군 정보 */}
                  {selectedJobRoleDetail && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h5 className="text-xs font-semibold text-gray-700 mb-3">| 직무 구성 (Job Composition)</h5>
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 rounded-lg px-4 py-3 border border-blue-200">
                          <span className="text-xs font-medium text-blue-700">직무</span>
                          <div className="text-sm font-semibold text-blue-900 mt-1">{selectedJobRoleDetail.name}</div>
                        </div>
                        <span className="text-gray-400">→</span>
                        <div className="flex flex-col gap-2">
                          {selectedJobRoleDetail.composition.map((comp, idx) => (
                            <div
                              key={idx}
                              className={`rounded px-3 py-2 border text-xs ${
                                comp === selectedSkillSetDetail.name
                                  ? 'bg-blue-100 border-blue-300 text-blue-900 font-semibold'
                                  : 'bg-gray-50 border-gray-200 text-gray-700'
                              }`}
                            >
                              {comp}
                              {comp === selectedSkillSetDetail.name && (
                                <span className="ml-2 text-blue-600">✓ 현재 선택</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 요소 기술 */}
                {selectedSkillSetDetail.technologies && (
                  <div className="space-y-4 mt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">②</span>
                      <h4 className="text-sm font-bold text-gray-900">요소 기술</h4>
                    </div>
                    {selectedSkillSetDetail.technologies.map((tech, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200">
                        <h5 className="text-xs font-semibold text-gray-700 mb-3">
                          [{tech.category}]
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {tech.items.map((item: string, itemIdx: number) => {
                            const techSelected = selectedTechnology as SelectedTechnology | null
                            const category: string = tech.category
                            const isSelected = techSelected !== null && 
                                              techSelected.name === item && 
                                              techSelected.category === category
                            const buttonClass = isSelected
                              ? 'bg-blue-500 text-white border-blue-500 font-semibold shadow-md'
                              : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300'
                            return (
                              <button
                                key={itemIdx}
                                onClick={(e) => handleTechnologyClick(item, category, e)}
                                className={`px-2 py-1 border rounded text-xs transition-all ${buttonClass}`}
                              >
                                {item}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : selectedJobRoleDetail ? (
              // 직군(Job Role) 상세 정보
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{selectedJobRoleDetail.name}</h3>
                  <button
                    onClick={() => {
                      setSelectedJobRole(null)
                      setSelectedSkillSet(null)
                      setSelectedTechnology(null)
                    }}
                    className="text-gray-400 hover:text-gray-600 text-xl"
                  >
                    ×
                  </button>
                </div>

                {/* ① 직무 개요 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">①</span>
                    <h4 className="text-sm font-bold text-gray-900">직무 개요</h4>
                  </div>

                  {/* 직무 정의 */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h5 className="text-xs font-semibold text-gray-700 mb-2">| 직무 정의 (Job Definition)</h5>
                    <p className="text-sm text-gray-700 leading-relaxed mb-2">
                      {selectedJobRoleDetail.definition}
                    </p>
                    <span className="text-xs text-gray-500">Tech 전문가</span>
                  </div>

                  {/* 직무 구성 */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h5 className="text-xs font-semibold text-gray-700 mb-3">| 직무 구성 (Job Composition)</h5>
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 rounded-lg px-4 py-3 border border-blue-200">
                        <span className="text-xs font-medium text-blue-700">직무</span>
                        <div className="text-sm font-semibold text-blue-900 mt-1">{selectedJobRoleDetail.name}</div>
                      </div>
                      <span className="text-gray-400">→</span>
                      <div className="flex flex-col gap-2">
                        {selectedJobRoleDetail.composition.map((comp, idx) => (
                          <div
                            key={idx}
                            className="bg-gray-50 rounded px-3 py-2 border border-gray-200 text-xs text-gray-700"
                          >
                            {comp}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                      <span>Industry</span>
                      <span>→</span>
                      <span>Skill set</span>
                    </div>
                  </div>

                  {/* 직무 Skill set */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h5 className="text-xs font-semibold text-gray-700 mb-3">| 직무 Skill set (Job Skill set)</h5>
                    <div className="space-y-3">
                      {selectedJobRoleDetail.composition.map((skillSetName, idx) => {
                        const skillSetDetail = selectedJobRoleDetail.skillSetDetails[skillSetName]
                        return (
                          <div
                            key={idx}
                            className="bg-blue-50 rounded-lg p-3 border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
                            onClick={() => {
                              setSelectedSkillSet(skillSetName)
                              setSelectedTechnology(null)
                            }}
                          >
                            <div className="text-sm font-semibold text-blue-900 mb-1">
                              {skillSetName}
                            </div>
                            {skillSetDetail?.description && (
                              <p className="text-xs text-gray-700 mt-1">{skillSetDetail.description}</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* 공통 기술 스택 */}
                <div className="mt-6 space-y-4">
                  <h4 className="text-sm font-bold text-gray-900 border-b border-gray-300 pb-2">
                    공통 (Common)
                  </h4>
                  {Object.entries(
                    selectedJobRoleDetail.name === 'Factory AX Engineering' 
                      ? factoryAXCommonTechnologies 
                      : selectedJobRoleDetail.name === 'Solution Development'
                      ? solutionDevelopmentCommonTechnologies
                      : selectedJobRoleDetail.name === 'Cloud/Infra Engineering'
                      ? cloudInfraCommonTechnologies
                      : selectedJobRoleDetail.name === 'Architect'
                      ? architectCommonTechnologies
                      : selectedJobRoleDetail.name === 'Project Management'
                      ? projectManagementCommonTechnologies
                      : selectedJobRoleDetail.name === 'Quality Management'
                      ? qualityManagementCommonTechnologies
                      : selectedJobRoleDetail.name === 'AI'
                      ? aiCommonTechnologies
                      : selectedJobRoleDetail.name === '정보보호'
                      ? informationSecurityCommonTechnologies
                      : selectedJobRoleDetail.name === 'Biz. Supporting'
                      ? bizSupportingCommonTechnologies
                      : commonTechnologies
                  ).map(([category, items]: [string, string[]]) => (
                    <div key={category} className="bg-white rounded-lg p-4 border border-gray-200">
                      <h5 className="text-xs font-semibold text-gray-700 mb-3">
                        [{category}]
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {items.map((item: string, itemIdx: number) => {
                          const techSelected = selectedTechnology as SelectedTechnology | null
                          const categoryKey: string = category
                          const isSelected = techSelected !== null && 
                                            techSelected.name === item && 
                                            techSelected.category === categoryKey
                          const buttonClass = isSelected
                            ? 'bg-blue-500 text-white border-blue-500 font-semibold shadow-md'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                          return (
                            <button
                              key={itemIdx}
                              onClick={(e) => handleTechnologyClick(item, categoryKey, e)}
                              className={`px-2 py-1 border rounded text-xs transition-all ${buttonClass}`}
                            >
                              {item}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* 하단 정보 */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex-shrink-0">
        <div className="text-xs text-gray-500 text-center">
          직무 13개, Skill set 55개
        </div>
      </div>
    </div>
  )
}

