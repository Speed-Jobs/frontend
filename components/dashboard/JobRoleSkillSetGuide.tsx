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
        skillSets: ['PMO', 'Quality Engineering', 'Offshoring Service Professional']
      },
      {
        name: 'AI',
        skillSets: ['AI/Data Development', 'Generative AI Development', 'Physical AI Development']
      },
      {
        name: '정보보호',
        skillSets: ['보안 Governance / Compliance', '보안 진단/Consulting', '보안 Solution Service']
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
        ]
      },
      {
        name: 'Domain Expert',
        skillSets: ['금융 도메인', '제조 도메인', '공공 도메인', 'B2C 도메인']
      },
      {
        name: 'Consulting',
        skillSets: ['ESG', 'SHE', 'ERP', 'CRM', 'SCM', 'AI']
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
        ]
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

