// SCRIPT D'INJECTION SUPABASE - À exécuter dans la console de production

console.log('🚀 Démarrage injection données historiques...');

// 1. Récupérer user_id
const { data: { user }, error: userError } = await supabase.auth.getUser();
if (userError || !user) {
  console.error('❌ Utilisateur non connecté:', userError);
  throw new Error('Connectez-vous d'abord');
}
console.log('✅ Utilisateur:', user.email, 'ID:', user.id);

// 2. Données à injecter  
const rawEntries = [
  {
    "id": "entry_2025_08_11_t2ci",
    "user_id": "TO_REPLACE_WITH_REAL_USER_ID",
    "entry_date": "2025-08-11",
    "sleep": {
      "bedTime": "22:00",
      "wakeTime": "07:00",
      "insomniaDuration": 0,
      "duration": 8
    },
    "focus": {
      "morningHours": 4.8,
      "afternoonHours": 3.2,
      "drivingHours": 0,
      "fatigue": 2
    },
    "tasks": [
      {
        "id": "task_0_ji1",
        "name": "App",
        "duration": 1,
        "isHighValue": true
      },
      {
        "id": "task_0_2q5",
        "name": "Recherche",
        "duration": 2,
        "isHighValue": true
      },
      {
        "id": "task_0_xg9",
        "name": "Veille",
        "duration": 3,
        "isHighValue": false
      },
      {
        "id": "task_0_2no",
        "name": "Prep Rdv",
        "duration": 2,
        "isHighValue": false
      }
    ],
    "wellbeing": {
      "meditationsPauses": {
        "morning": false,
        "noon": false,
        "afternoon": false,
        "evening": false
      },
      "sportLeisureHours": 0.5,
      "socialInteraction": true,
      "energy": 50
    },
    "created_at": "2025-09-12T17:42:18.140Z",
    "updated_at": "2025-09-12T17:42:18.140Z"
  },
  {
    "id": "entry_2025_08_12_z73o",
    "user_id": "TO_REPLACE_WITH_REAL_USER_ID",
    "entry_date": "2025-08-12",
    "sleep": {
      "bedTime": "22:00",
      "wakeTime": "07:00",
      "insomniaDuration": 0,
      "duration": 7
    },
    "focus": {
      "morningHours": 4.8,
      "afternoonHours": 3.2,
      "drivingHours": 0,
      "fatigue": 4
    },
    "tasks": [
      {
        "id": "task_1_6qm",
        "name": "Recherche",
        "duration": 3,
        "isHighValue": true
      },
      {
        "id": "task_1_hwc",
        "name": "Admin",
        "duration": 2,
        "isHighValue": false
      },
      {
        "id": "task_1_var",
        "name": "Veille",
        "duration": 3,
        "isHighValue": false
      }
    ],
    "wellbeing": {
      "meditationsPauses": {
        "morning": false,
        "noon": false,
        "afternoon": false,
        "evening": false
      },
      "sportLeisureHours": 0.5,
      "socialInteraction": false,
      "energy": 50
    },
    "created_at": "2025-09-12T17:42:18.140Z",
    "updated_at": "2025-09-12T17:42:18.140Z"
  },
  {
    "id": "entry_2025_08_13_viqr",
    "user_id": "TO_REPLACE_WITH_REAL_USER_ID",
    "entry_date": "2025-08-13",
    "sleep": {
      "bedTime": "22:00",
      "wakeTime": "07:00",
      "insomniaDuration": 0,
      "duration": 8
    },
    "focus": {
      "morningHours": 4.8,
      "afternoonHours": 3.2,
      "drivingHours": 0,
      "fatigue": 4
    },
    "tasks": [
      {
        "id": "task_2_7rw",
        "name": "App",
        "duration": 2,
        "isHighValue": true
      },
      {
        "id": "task_2_gsr",
        "name": "Veille",
        "duration": 2,
        "isHighValue": false
      },
      {
        "id": "task_2_gqj",
        "name": "Prep Rdv",
        "duration": 1,
        "isHighValue": false
      },
      {
        "id": "task_2_laz",
        "name": "Recherche",
        "duration": 3,
        "isHighValue": true
      }
    ],
    "wellbeing": {
      "meditationsPauses": {
        "morning": true,
        "noon": false,
        "afternoon": false,
        "evening": false
      },
      "sportLeisureHours": 0.5,
      "socialInteraction": true,
      "energy": 50
    },
    "created_at": "2025-09-12T17:42:18.140Z",
    "updated_at": "2025-09-12T17:42:18.140Z"
  },
  {
    "id": "entry_2025_08_14_rnfq",
    "user_id": "TO_REPLACE_WITH_REAL_USER_ID",
    "entry_date": "2025-08-14",
    "sleep": {
      "bedTime": "22:00",
      "wakeTime": "07:00",
      "insomniaDuration": 0,
      "duration": 0
    },
    "focus": {
      "morningHours": 3.9,
      "afternoonHours": 2.6,
      "drivingHours": 0,
      "fatigue": 5
    },
    "tasks": [
      {
        "id": "task_3_sn5",
        "name": "App",
        "duration": 1,
        "isHighValue": true
      },
      {
        "id": "task_3_bup",
        "name": "Recherche",
        "duration": 5,
        "isHighValue": true
      },
      {
        "id": "task_3_82y",
        "name": "Prep rdv",
        "duration": 0.5,
        "isHighValue": false
      }
    ],
    "wellbeing": {
      "meditationsPauses": {
        "morning": true,
        "noon": false,
        "afternoon": false,
        "evening": false
      },
      "sportLeisureHours": 0.5,
      "socialInteraction": true,
      "energy": 50
    },
    "created_at": "2025-09-12T17:42:18.141Z",
    "updated_at": "2025-09-12T17:42:18.141Z"
  },
  {
    "id": "entry_2025_08_18_z96d",
    "user_id": "TO_REPLACE_WITH_REAL_USER_ID",
    "entry_date": "2025-08-18",
    "sleep": {
      "bedTime": "22:00",
      "wakeTime": "07:00",
      "insomniaDuration": 0,
      "duration": 8.5
    },
    "focus": {
      "morningHours": 5.1,
      "afternoonHours": 3.4000000000000004,
      "drivingHours": 0,
      "fatigue": 3
    },
    "tasks": [
      {
        "id": "task_4_oo8",
        "name": "Veille",
        "duration": 3,
        "isHighValue": false
      },
      {
        "id": "task_4_8vt",
        "name": "Prep forma",
        "duration": 1.5,
        "isHighValue": true
      },
      {
        "id": "task_4_krt",
        "name": "Recherche",
        "duration": 2.5,
        "isHighValue": true
      },
      {
        "id": "task_4_t6k",
        "name": "App",
        "duration": 1.5,
        "isHighValue": true
      }
    ],
    "wellbeing": {
      "meditationsPauses": {
        "morning": true,
        "noon": false,
        "afternoon": false,
        "evening": false
      },
      "sportLeisureHours": 0.5,
      "socialInteraction": false,
      "energy": 50
    },
    "created_at": "2025-09-12T17:42:18.141Z",
    "updated_at": "2025-09-12T17:42:18.141Z"
  },
  {
    "id": "entry_2025_08_19_jtdu",
    "user_id": "TO_REPLACE_WITH_REAL_USER_ID",
    "entry_date": "2025-08-19",
    "sleep": {
      "bedTime": "22:00",
      "wakeTime": "07:00",
      "insomniaDuration": 0,
      "duration": 8
    },
    "focus": {
      "morningHours": 6,
      "afternoonHours": 4.2,
      "drivingHours": 1.5,
      "fatigue": 3
    },
    "tasks": [
      {
        "id": "task_5_9bu",
        "name": "Prep forma",
        "duration": 3,
        "isHighValue": true
      },
      {
        "id": "task_5_82v",
        "name": "Networking",
        "duration": 6,
        "isHighValue": false
      },
      {
        "id": "task_5_vj7",
        "name": "Transport",
        "duration": 1.5,
        "isHighValue": false
      }
    ],
    "wellbeing": {
      "meditationsPauses": {
        "morning": false,
        "noon": false,
        "afternoon": false,
        "evening": false
      },
      "sportLeisureHours": 0.5,
      "socialInteraction": true,
      "energy": 50
    },
    "created_at": "2025-09-12T17:42:18.141Z",
    "updated_at": "2025-09-12T17:42:18.141Z"
  },
  {
    "id": "entry_2025_08_20_j9az",
    "user_id": "TO_REPLACE_WITH_REAL_USER_ID",
    "entry_date": "2025-08-20",
    "sleep": {
      "bedTime": "22:00",
      "wakeTime": "07:00",
      "insomniaDuration": 0,
      "duration": 7.5
    },
    "focus": {
      "morningHours": 3.5999999999999996,
      "afternoonHours": 2.4000000000000004,
      "drivingHours": 1.5,
      "fatigue": 3
    },
    "tasks": [
      {
        "id": "task_6_h3b",
        "name": "Rdv",
        "duration": 1,
        "isHighValue": false
      },
      {
        "id": "task_6_xsl",
        "name": "Mails",
        "duration": 1.5,
        "isHighValue": false
      },
      {
        "id": "task_6_y8q",
        "name": "Prep rdv",
        "duration": 2,
        "isHighValue": false
      },
      {
        "id": "task_6_s2c",
        "name": "Transport",
        "duration": 1.5,
        "isHighValue": false
      }
    ],
    "wellbeing": {
      "meditationsPauses": {
        "morning": true,
        "noon": false,
        "afternoon": false,
        "evening": false
      },
      "sportLeisureHours": 0.5,
      "socialInteraction": true,
      "energy": 50
    },
    "created_at": "2025-09-12T17:42:18.141Z",
    "updated_at": "2025-09-12T17:42:18.141Z"
  },
  {
    "id": "entry_2025_08_22_d6zi",
    "user_id": "TO_REPLACE_WITH_REAL_USER_ID",
    "entry_date": "2025-08-22",
    "sleep": {
      "bedTime": "22:00",
      "wakeTime": "07:00",
      "insomniaDuration": 0,
      "duration": 7.5
    },
    "focus": {
      "morningHours": 5.1,
      "afternoonHours": 3.4000000000000004,
      "drivingHours": 0,
      "fatigue": 4
    },
    "tasks": [
      {
        "id": "task_7_b7n",
        "name": "Rdv",
        "duration": 2.5,
        "isHighValue": false
      },
      {
        "id": "task_7_916",
        "name": "prep froma",
        "duration": 6,
        "isHighValue": false
      }
    ],
    "wellbeing": {
      "meditationsPauses": {
        "morning": false,
        "noon": false,
        "afternoon": false,
        "evening": false
      },
      "sportLeisureHours": 0.5,
      "socialInteraction": true,
      "energy": 50
    },
    "created_at": "2025-09-12T17:42:18.141Z",
    "updated_at": "2025-09-12T17:42:18.141Z"
  },
  {
    "id": "entry_2025_08_25_z4mj",
    "user_id": "TO_REPLACE_WITH_REAL_USER_ID",
    "entry_date": "2025-08-25",
    "sleep": {
      "bedTime": "22:00",
      "wakeTime": "07:00",
      "insomniaDuration": 0,
      "duration": 8.5
    },
    "focus": {
      "morningHours": 4.8,
      "afternoonHours": 3.2,
      "drivingHours": 0,
      "fatigue": 5
    },
    "tasks": [
      {
        "id": "task_8_cvn",
        "name": "Recherche",
        "duration": 2.5,
        "isHighValue": true
      },
      {
        "id": "task_8_6gl",
        "name": "Partenariat",
        "duration": 0.5,
        "isHighValue": false
      },
      {
        "id": "task_8_5rs",
        "name": "mails",
        "duration": 1,
        "isHighValue": false
      },
      {
        "id": "task_8_mro",
        "name": "Admin",
        "duration": 0.5,
        "isHighValue": false
      },
      {
        "id": "task_8_v0p",
        "name": "prep forma",
        "duration": 3.5,
        "isHighValue": true
      }
    ],
    "wellbeing": {
      "meditationsPauses": {
        "morning": false,
        "noon": false,
        "afternoon": false,
        "evening": false
      },
      "sportLeisureHours": 0.5,
      "socialInteraction": true,
      "energy": 50
    },
    "created_at": "2025-09-12T17:42:18.141Z",
    "updated_at": "2025-09-12T17:42:18.141Z"
  },
  {
    "id": "entry_2025_08_26_egy5",
    "user_id": "TO_REPLACE_WITH_REAL_USER_ID",
    "entry_date": "2025-08-26",
    "sleep": {
      "bedTime": "22:00",
      "wakeTime": "07:00",
      "insomniaDuration": 0,
      "duration": 8
    },
    "focus": {
      "morningHours": 4.2,
      "afternoonHours": 2.8000000000000003,
      "drivingHours": 1.5,
      "fatigue": 5
    },
    "tasks": [
      {
        "id": "task_9_k8c",
        "name": "admin",
        "duration": 1,
        "isHighValue": false
      },
      {
        "id": "task_9_k1s",
        "name": "forma",
        "duration": 4.5,
        "isHighValue": true
      },
      {
        "id": "task_9_09j",
        "name": "Transport",
        "duration": 1.5,
        "isHighValue": false
      }
    ],
    "wellbeing": {
      "meditationsPauses": {
        "morning": true,
        "noon": false,
        "afternoon": false,
        "evening": false
      },
      "sportLeisureHours": 0.5,
      "socialInteraction": false,
      "energy": 50
    },
    "created_at": "2025-09-12T17:42:18.141Z",
    "updated_at": "2025-09-12T17:42:18.141Z"
  },
  {
    "id": "entry_2025_08_27_11lh",
    "user_id": "TO_REPLACE_WITH_REAL_USER_ID",
    "entry_date": "2025-08-27",
    "sleep": {
      "bedTime": "22:00",
      "wakeTime": "07:00",
      "insomniaDuration": 0,
      "duration": 7.25
    },
    "focus": {
      "morningHours": 4.2,
      "afternoonHours": 2.8000000000000003,
      "drivingHours": 0,
      "fatigue": 4
    },
    "tasks": [
      {
        "id": "task_10_1f7",
        "name": "prep forma",
        "duration": 0.5,
        "isHighValue": true
      },
      {
        "id": "task_10_coc",
        "name": "app",
        "duration": 3,
        "isHighValue": true
      },
      {
        "id": "task_10_9e3",
        "name": "rdv",
        "duration": 1.5,
        "isHighValue": false
      },
      {
        "id": "task_10_tsn",
        "name": "Admin",
        "duration": 2,
        "isHighValue": false
      }
    ],
    "wellbeing": {
      "meditationsPauses": {
        "morning": false,
        "noon": false,
        "afternoon": false,
        "evening": false
      },
      "sportLeisureHours": 0.5,
      "socialInteraction": true,
      "energy": 50
    },
    "created_at": "2025-09-12T17:42:18.141Z",
    "updated_at": "2025-09-12T17:42:18.141Z"
  },
  {
    "id": "entry_2025_08_28_94yp",
    "user_id": "TO_REPLACE_WITH_REAL_USER_ID",
    "entry_date": "2025-08-28",
    "sleep": {
      "bedTime": "22:00",
      "wakeTime": "07:00",
      "insomniaDuration": 0,
      "duration": 7.5
    },
    "focus": {
      "morningHours": 6,
      "afternoonHours": 4.2,
      "drivingHours": 0,
      "fatigue": 4
    },
    "tasks": [
      {
        "id": "task_11_zby",
        "name": "rdv",
        "duration": 0.5,
        "isHighValue": false
      },
      {
        "id": "task_11_ykf",
        "name": "partenariat",
        "duration": 4,
        "isHighValue": false
      },
      {
        "id": "task_11_ewq",
        "name": "App",
        "duration": 2,
        "isHighValue": true
      },
      {
        "id": "task_11_21j",
        "name": "Networking",
        "duration": 4,
        "isHighValue": false
      }
    ],
    "wellbeing": {
      "meditationsPauses": {
        "morning": true,
        "noon": false,
        "afternoon": false,
        "evening": false
      },
      "sportLeisureHours": 0.5,
      "socialInteraction": true,
      "energy": 50
    },
    "created_at": "2025-09-12T17:42:18.141Z",
    "updated_at": "2025-09-12T17:42:18.141Z"
  },
  {
    "id": "entry_2025_08_29_w7w4",
    "user_id": "TO_REPLACE_WITH_REAL_USER_ID",
    "entry_date": "2025-08-29",
    "sleep": {
      "bedTime": "22:00",
      "wakeTime": "07:00",
      "insomniaDuration": 0,
      "duration": 8.5
    },
    "focus": {
      "morningHours": 3.9,
      "afternoonHours": 2.6,
      "drivingHours": 0,
      "fatigue": 3
    },
    "tasks": [
      {
        "id": "task_12_f7i",
        "name": "Admin",
        "duration": 3.5,
        "isHighValue": false
      },
      {
        "id": "task_12_fu9",
        "name": "rdv",
        "duration": 1,
        "isHighValue": false
      },
      {
        "id": "task_12_6fq",
        "name": "prep forma",
        "duration": 2,
        "isHighValue": true
      }
    ],
    "wellbeing": {
      "meditationsPauses": {
        "morning": true,
        "noon": false,
        "afternoon": false,
        "evening": false
      },
      "sportLeisureHours": 0.5,
      "socialInteraction": true,
      "energy": 50
    },
    "created_at": "2025-09-12T17:42:18.141Z",
    "updated_at": "2025-09-12T17:42:18.141Z"
  },
  {
    "id": "entry_2025_09_01_5o1i",
    "user_id": "TO_REPLACE_WITH_REAL_USER_ID",
    "entry_date": "2025-09-01",
    "sleep": {
      "bedTime": "22:00",
      "wakeTime": "07:00",
      "insomniaDuration": 0,
      "duration": 6.5
    },
    "focus": {
      "morningHours": 4.5,
      "afternoonHours": 3,
      "drivingHours": 0,
      "fatigue": 3
    },
    "tasks": [
      {
        "id": "task_13_12o",
        "name": "partenariat",
        "duration": 4.5,
        "isHighValue": false
      },
      {
        "id": "task_13_2er",
        "name": "app",
        "duration": 1,
        "isHighValue": true
      },
      {
        "id": "task_13_fg2",
        "name": "Mails",
        "duration": 1,
        "isHighValue": false
      },
      {
        "id": "task_13_vau",
        "name": "Admin",
        "duration": 1,
        "isHighValue": false
      }
    ],
    "wellbeing": {
      "meditationsPauses": {
        "morning": false,
        "noon": false,
        "afternoon": false,
        "evening": false
      },
      "sportLeisureHours": 0.5,
      "socialInteraction": true,
      "energy": 50
    },
    "created_at": "2025-09-12T17:42:18.141Z",
    "updated_at": "2025-09-12T17:42:18.141Z"
  },
  {
    "id": "entry_2025_09_02_o0z8",
    "user_id": "TO_REPLACE_WITH_REAL_USER_ID",
    "entry_date": "2025-09-02",
    "sleep": {
      "bedTime": "22:00",
      "wakeTime": "07:00",
      "insomniaDuration": 0,
      "duration": 8.5
    },
    "focus": {
      "morningHours": 4.5,
      "afternoonHours": 3,
      "drivingHours": 2.5,
      "fatigue": 3
    },
    "tasks": [
      {
        "id": "task_14_w8p",
        "name": "Transport",
        "duration": 2.5,
        "isHighValue": false
      },
      {
        "id": "task_14_0wz",
        "name": "rdv perso",
        "duration": 1,
        "isHighValue": false
      },
      {
        "id": "task_14_h4l",
        "name": "Networking",
        "duration": 4,
        "isHighValue": false
      }
    ],
    "wellbeing": {
      "meditationsPauses": {
        "morning": false,
        "noon": false,
        "afternoon": false,
        "evening": false
      },
      "sportLeisureHours": 0.5,
      "socialInteraction": true,
      "energy": 50
    },
    "created_at": "2025-09-12T17:42:18.141Z",
    "updated_at": "2025-09-12T17:42:18.141Z"
  },
  {
    "id": "entry_2025_09_03_7em5",
    "user_id": "TO_REPLACE_WITH_REAL_USER_ID",
    "entry_date": "2025-09-03",
    "sleep": {
      "bedTime": "22:00",
      "wakeTime": "07:00",
      "insomniaDuration": 0,
      "duration": 0
    },
    "focus": {
      "morningHours": 6,
      "afternoonHours": 4.4,
      "drivingHours": 0,
      "fatigue": 3
    },
    "tasks": [
      {
        "id": "task_15_gt7",
        "name": "Rdv",
        "duration": 2,
        "isHighValue": false
      },
      {
        "id": "task_15_xwa",
        "name": "prep forma",
        "duration": 7,
        "isHighValue": true
      },
      {
        "id": "task_15_gi4",
        "name": "Networking",
        "duration": 1,
        "isHighValue": false
      },
      {
        "id": "task_15_bmg",
        "name": "admin",
        "duration": 1,
        "isHighValue": false
      }
    ],
    "wellbeing": {
      "meditationsPauses": {
        "morning": true,
        "noon": false,
        "afternoon": false,
        "evening": false
      },
      "sportLeisureHours": 0.5,
      "socialInteraction": true,
      "energy": 50
    },
    "created_at": "2025-09-12T17:42:18.141Z",
    "updated_at": "2025-09-12T17:42:18.141Z"
  },
  {
    "id": "entry_2025_09_04_t0fo",
    "user_id": "TO_REPLACE_WITH_REAL_USER_ID",
    "entry_date": "2025-09-04",
    "sleep": {
      "bedTime": "22:00",
      "wakeTime": "07:00",
      "insomniaDuration": 0,
      "duration": 8
    },
    "focus": {
      "morningHours": 5.3999999999999995,
      "afternoonHours": 3.6,
      "drivingHours": 0,
      "fatigue": 4
    },
    "tasks": [
      {
        "id": "task_16_ptd",
        "name": "prep forma",
        "duration": 6,
        "isHighValue": true
      },
      {
        "id": "task_16_ily",
        "name": "rdv",
        "duration": 2.5,
        "isHighValue": false
      },
      {
        "id": "task_16_0uw",
        "name": "mails",
        "duration": 0.5,
        "isHighValue": false
      }
    ],
    "wellbeing": {
      "meditationsPauses": {
        "morning": true,
        "noon": false,
        "afternoon": false,
        "evening": false
      },
      "sportLeisureHours": 0.5,
      "socialInteraction": true,
      "energy": 50
    },
    "created_at": "2025-09-12T17:42:18.141Z",
    "updated_at": "2025-09-12T17:42:18.141Z"
  },
  {
    "id": "entry_2025_09_05_ysmo",
    "user_id": "TO_REPLACE_WITH_REAL_USER_ID",
    "entry_date": "2025-09-05",
    "sleep": {
      "bedTime": "22:00",
      "wakeTime": "07:00",
      "insomniaDuration": 0,
      "duration": 0
    },
    "focus": {
      "morningHours": 5.7,
      "afternoonHours": 3.8000000000000003,
      "drivingHours": 0,
      "fatigue": 5
    },
    "tasks": [
      {
        "id": "task_17_gqb",
        "name": "Admin",
        "duration": 1,
        "isHighValue": false
      },
      {
        "id": "task_17_t5x",
        "name": "prep forma",
        "duration": 7,
        "isHighValue": true
      },
      {
        "id": "task_17_ijs",
        "name": "rdv",
        "duration": 1,
        "isHighValue": false
      },
      {
        "id": "task_17_tp6",
        "name": "mails",
        "duration": 0.5,
        "isHighValue": false
      }
    ],
    "wellbeing": {
      "meditationsPauses": {
        "morning": false,
        "noon": false,
        "afternoon": false,
        "evening": false
      },
      "sportLeisureHours": 0.5,
      "socialInteraction": true,
      "energy": 50
    },
    "created_at": "2025-09-12T17:42:18.141Z",
    "updated_at": "2025-09-12T17:42:18.141Z"
  },
  {
    "id": "entry_2025_09_08_alhc",
    "user_id": "TO_REPLACE_WITH_REAL_USER_ID",
    "entry_date": "2025-09-08",
    "sleep": {
      "bedTime": "22:00",
      "wakeTime": "07:00",
      "insomniaDuration": 0,
      "duration": 8
    },
    "focus": {
      "morningHours": 6,
      "afternoonHours": 4.4,
      "drivingHours": 0,
      "fatigue": 5
    },
    "tasks": [
      {
        "id": "task_18_pne",
        "name": "prep forma",
        "duration": 11,
        "isHighValue": true
      }
    ],
    "wellbeing": {
      "meditationsPauses": {
        "morning": false,
        "noon": false,
        "afternoon": false,
        "evening": false
      },
      "sportLeisureHours": 0.5,
      "socialInteraction": false,
      "energy": 50
    },
    "created_at": "2025-09-12T17:42:18.141Z",
    "updated_at": "2025-09-12T17:42:18.141Z"
  },
  {
    "id": "entry_2025_09_09_hh47",
    "user_id": "TO_REPLACE_WITH_REAL_USER_ID",
    "entry_date": "2025-09-09",
    "sleep": {
      "bedTime": "22:00",
      "wakeTime": "07:00",
      "insomniaDuration": 0,
      "duration": 7
    },
    "focus": {
      "morningHours": 5.7,
      "afternoonHours": 3.8000000000000003,
      "drivingHours": 2,
      "fatigue": 4
    },
    "tasks": [
      {
        "id": "task_19_olg",
        "name": "forma",
        "duration": 7.5,
        "isHighValue": true
      },
      {
        "id": "task_19_y1d",
        "name": "Transport",
        "duration": 2,
        "isHighValue": false
      }
    ],
    "wellbeing": {
      "meditationsPauses": {
        "morning": false,
        "noon": false,
        "afternoon": false,
        "evening": false
      },
      "sportLeisureHours": 0.5,
      "socialInteraction": false,
      "energy": 50
    },
    "created_at": "2025-09-12T17:42:18.141Z",
    "updated_at": "2025-09-12T17:42:18.141Z"
  },
  {
    "id": "entry_2025_09_10_kpuh",
    "user_id": "TO_REPLACE_WITH_REAL_USER_ID",
    "entry_date": "2025-09-10",
    "sleep": {
      "bedTime": "22:00",
      "wakeTime": "07:00",
      "insomniaDuration": 0,
      "duration": 8
    },
    "focus": {
      "morningHours": 5.3999999999999995,
      "afternoonHours": 3.6,
      "drivingHours": 0,
      "fatigue": 4
    },
    "tasks": [
      {
        "id": "task_20_u2x",
        "name": "mails",
        "duration": 2,
        "isHighValue": false
      },
      {
        "id": "task_20_xf6",
        "name": "rdv",
        "duration": 0.5,
        "isHighValue": false
      },
      {
        "id": "task_20_l46",
        "name": "prep forma",
        "duration": 5,
        "isHighValue": true
      },
      {
        "id": "task_20_ocm",
        "name": "App",
        "duration": 1.5,
        "isHighValue": true
      }
    ],
    "wellbeing": {
      "meditationsPauses": {
        "morning": true,
        "noon": false,
        "afternoon": false,
        "evening": false
      },
      "sportLeisureHours": 0.5,
      "socialInteraction": true,
      "energy": 50
    },
    "created_at": "2025-09-12T17:42:18.141Z",
    "updated_at": "2025-09-12T17:42:18.141Z"
  },
  {
    "id": "entry_2025_09_11_99p0",
    "user_id": "TO_REPLACE_WITH_REAL_USER_ID",
    "entry_date": "2025-09-11",
    "sleep": {
      "bedTime": "22:00",
      "wakeTime": "07:00",
      "insomniaDuration": 0,
      "duration": 6
    },
    "focus": {
      "morningHours": 4.8,
      "afternoonHours": 3.2,
      "drivingHours": 0,
      "fatigue": 4
    },
    "tasks": [
      {
        "id": "task_21_v6x",
        "name": "Strategic",
        "duration": 4.5,
        "isHighValue": true
      },
      {
        "id": "task_21_pc4",
        "name": "mails",
        "duration": 2,
        "isHighValue": false
      },
      {
        "id": "task_21_64y",
        "name": "App",
        "duration": 1.5,
        "isHighValue": true
      }
    ],
    "wellbeing": {
      "meditationsPauses": {
        "morning": false,
        "noon": false,
        "afternoon": false,
        "evening": false
      },
      "sportLeisureHours": 0.5,
      "socialInteraction": false,
      "energy": 50
    },
    "created_at": "2025-09-12T17:42:18.141Z",
    "updated_at": "2025-09-12T17:42:18.141Z"
  },
  {
    "id": "entry_2025_09_12_wy19",
    "user_id": "TO_REPLACE_WITH_REAL_USER_ID",
    "entry_date": "2025-09-12",
    "sleep": {
      "bedTime": "22:00",
      "wakeTime": "07:00",
      "insomniaDuration": 0,
      "duration": 7.5
    },
    "focus": {
      "morningHours": 0,
      "afternoonHours": 0,
      "drivingHours": 0,
      "fatigue": 5
    },
    "tasks": [],
    "wellbeing": {
      "meditationsPauses": {
        "morning": true,
        "noon": false,
        "afternoon": false,
        "evening": false
      },
      "sportLeisureHours": 0.5,
      "socialInteraction": false,
      "energy": 50
    },
    "created_at": "2025-09-12T17:42:18.141Z",
    "updated_at": "2025-09-12T17:42:18.141Z"
  }
];

// 3. Remplacer user_id
const entries = rawEntries.map(entry => ({ ...entry, user_id: user.id }));

// 4. Vérifier doublons
const { data: existing } = await supabase.from('daily_entries').select('entry_date').eq('user_id', user.id);
const existingDates = new Set((existing || []).map(e => e.entry_date));
const newEntries = entries.filter(e => !existingDates.has(e.entry_date));

console.log('📊 Entrées à injecter:', newEntries.length, '/ Total:', entries.length);

if (newEntries.length === 0) {
  console.log('✅ Toutes les données déjà présentes');
} else {
  // 5. Injection
  let injected = 0;
  for (let i = 0; i < newEntries.length; i += 3) {
    const batch = newEntries.slice(i, i + 3);
    console.log('🔄 Lot', Math.floor(i/3) + 1, ':', batch.length, 'entrées');
    
    const { error } = await supabase.from('daily_entries').insert(batch);
    if (error) {
      console.error('❌ Erreur:', error);
    } else {
      injected += batch.length;
      console.log('✅ Lot injecté');
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log('🎉 TERMINÉ:', injected, 'entrées injectées !');
  console.log('🔄 Rechargez la page pour voir vos données');
}