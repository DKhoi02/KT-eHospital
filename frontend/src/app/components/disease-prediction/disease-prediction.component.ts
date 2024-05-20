import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import ValidateForm from 'src/app/helpers/validateForms';
import { MachineLearningService } from 'src/app/services/machine-learning.service';
import Swal from 'sweetalert2';
import { Chart, registerables } from 'node_modules/chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(...registerables);

@Component({
  selector: 'app-disease-prediction',
  templateUrl: './disease-prediction.component.html',
  styleUrls: ['./disease-prediction.component.css'],
})
export class DiseasePredictionComponent implements OnInit {
  lstSymptomData: string[] = [
    'itching',
    'skin_rash',
    'nodal_skin_eruptions',
    'continuous_sneezing',
    'shivering',
    'chills',
    'joint_pain',
    'stomach_pain',
    'acidity',
    'ulcers_on_tongue',
    'muscle_wasting',
    'vomiting',
    'burning_micturition',
    'spotting_ urination',
    'fatigue',
    'weight_gain',
    'anxiety',
    'cold_hands_and_feets',
    'mood_swings',
    'weight_loss',
    'restlessness',
    'lethargy',
    'patches_in_throat',
    'irregular_sugar_level',
    'cough',
    'high_fever',
    'sunken_eyes',
    'breathlessness',
    'sweating',
    'dehydration',
    'indigestion',
    'headache',
    'yellowish_skin',
    'dark_urine',
    'nausea',
    'loss_of_appetite',
    'pain_behind_the_eyes',
    'back_pain',
    'constipation',
    'abdominal_pain',
    'diarrhoea',
    'mild_fever',
    'yellow_urine',
    'yellowing_of_eyes',
    'acute_liver_failure',
    'fluid_overload',
    'swelling_of_stomach',
    'swelled_lymph_nodes',
    'malaise',
    'blurred_and_distorted_vision',
    'phlegm',
    'throat_irritation',
    'redness_of_eyes',
    'sinus_pressure',
    'runny_nose',
    'congestion',
    'chest_pain',
    'weakness_in_limbs',
    'fast_heart_rate',
    'pain_during_bowel_movements',
    'pain_in_anal_region',
    'bloody_stool',
    'irritation_in_anus',
    'neck_pain',
    'dizziness',
    'cramps',
    'bruising',
    'obesity',
    'swollen_legs',
    'swollen_blood_vessels',
    'puffy_face_and_eyes',
    'enlarged_thyroid',
    'brittle_nails',
    'swollen_extremeties',
    'excessive_hunger',
    'extra_marital_contacts',
    'drying_and_tingling_lips',
    'slurred_speech',
    'knee_pain',
    'hip_joint_pain',
    'muscle_weakness',
    'stiff_neck',
    'swelling_joints',
    'movement_stiffness',
    'spinning_movements',
    'loss_of_balance',
    'unsteadiness',
    'weakness_of_one_body_side',
    'loss_of_smell',
    'bladder_discomfort',
    'foul_smell_of urine',
    'continuous_feel_of_urine',
    'passage_of_gases',
    'internal_itching',
    'toxic_look_(typhos)',
    'depression',
    'irritability',
    'muscle_pain',
    'altered_sensorium',
    'red_spots_over_body',
    'belly_pain',
    'abnormal_menstruation',
    'dischromic _patches',
    'watering_from_eyes',
    'increased_appetite',
    'polyuria',
    'family_history',
    'mucoid_sputum',
    'rusty_sputum',
    'lack_of_concentration',
    'visual_disturbances',
    'receiving_blood_transfusion',
    'receiving_unsterile_injections',
    'coma',
    'stomach_bleeding',
    'distention_of_abdomen',
    'history_of_alcohol_consumption',
    'blood_in_sputum',
    'prominent_veins_on_calf',
    'palpitations',
    'painful_walking',
    'pus_filled_pimples',
    'blackheads',
    'scurring',
    'skin_peeling',
    'silver_like_dusting',
    'small_dents_in_nails',
    'inflammatory_nails',
    'blister',
    'red_sore_around_nose',
    'yellow_crust_ooze',
  ];
  radarChart: any;
  lstSymptoms = this.lstSymptomData;
  lstSymptomed: string[] = [];
  public symptomForm!: FormGroup;
  lstDisease: any;
  diseaseTop1Name: any;
  diseaseTop2Name: any;
  diseaseTop3Name: any;
  diseaseTop4Name: any;
  diseaseTop5Name: any;
  diseaseTop1Percent: any;
  diseaseTop2Percent: any;
  diseaseTop3Percent: any;
  diseaseTop4Percent: any;
  diseaseTop5Percent: any;
  public isShowChart: string = 'block';
  public isShowTable: string = 'none';
  lstResult: string[] = [];
  lstDiseaseName: string[] = [];

  constructor(
    private fb: FormBuilder,
    private machineLearning: MachineLearningService
  ) {}

  ngOnInit() {
    this.symptomForm = this.fb.group({
      symptom: ['', [Validators.required, this.checkSymptom()]],
    });
  }

  checkSymptom(): ValidatorFn {
    return (control: any): { [key: string]: any } | null => {
      if (!this.lstSymptoms.includes(control.value)) {
        return { isWrongSymptom: true };
      }
      return null;
    };
  }
  onAddSymptom() {
    if (this.symptomForm.valid) {
      this.lstSymptomed.push(this.symptomForm.get('symptom')?.value);
      const index = this.lstSymptoms.indexOf(
        this.symptomForm.get('symptom')?.value
      );
      this.lstSymptoms.splice(index, 1);
      this.symptomForm.reset();
    } else {
      ValidateForm.validateAllFormFields(this.symptomForm);
    }
  }

  onDelete(index: number, symptom: string) {
    this.lstSymptomed.splice(index, 1);
    this.lstSymptoms.push(symptom);
  }

  onChart() {
    this.isShowChart = 'none';
    this.isShowTable = 'block';
  }

  onTable() {
    this.isShowTable = 'none';
    this.isShowChart = 'block';
  }

  RadarChart() {
    const data = {
      labels: this.lstDiseaseName,
      datasets: [
        {
          label: 'Incidence rates is(%) ',
          data: this.lstResult,

          backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)',
            '#71b657',
            '#e3632d',
            '#6c757d',
          ],
          hoverOffset: 4,
        },
      ],
    };

    this.radarChart = new Chart('radarChart', {
      type: 'pie',
      data: data,
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
        plugins: {
          datalabels: {
            color: 'white',
          },
        },
      },
      plugins: [ChartDataLabels],
    });
  }

  onFinish() {
    if (this.lstSymptomed.length > 0) {
      Swal.fire({
        html: `
    <div id="background" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 999; background-color: rgba(0, 0, 0, 0.5);"></div>
    <img id="image" src="assets/img/loading.gif" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1000; display: none;">
  `,
        width: 0,
        showConfirmButton: false,
      });

      setTimeout(() => {
        const image = document.getElementById('image');
        if (image) {
          image.style.display = 'block';
        }
      }, 500);
      this.machineLearning
        .diseasePrediction(this.lstSymptomed)
        .subscribe((res) => {
          Swal.close();
          this.lstDiseaseName = [];
          this.lstResult = [];
          if (this.radarChart) {
            this.radarChart.destroy();
          }

          this.lstDisease = res;
          this.diseaseTop1Name = Object.keys(this.lstDisease[0])[0];
          this.lstDiseaseName.push(this.diseaseTop1Name);
          this.diseaseTop1Percent = Object.values(this.lstDisease[0])[0];

          this.diseaseTop2Name = Object.keys(this.lstDisease[1])[0];
          this.lstDiseaseName.push(this.diseaseTop2Name);
          this.diseaseTop2Percent = Object.values(this.lstDisease[1])[0];

          this.diseaseTop3Name = Object.keys(this.lstDisease[2])[0];
          this.lstDiseaseName.push(this.diseaseTop3Name);
          this.diseaseTop3Percent = Object.values(this.lstDisease[2])[0];

          this.diseaseTop4Name = Object.keys(this.lstDisease[3])[0];
          this.lstDiseaseName.push(this.diseaseTop4Name);
          this.diseaseTop4Percent = Object.values(this.lstDisease[3])[0];

          this.diseaseTop5Name = Object.keys(this.lstDisease[4])[0];
          this.lstDiseaseName.push(this.diseaseTop5Name);
          this.diseaseTop5Percent = Object.values(this.lstDisease[4])[0];

          const total =
            this.diseaseTop1Percent +
            this.diseaseTop2Percent +
            this.diseaseTop3Percent +
            this.diseaseTop4Percent +
            this.diseaseTop5Percent;

          this.diseaseTop1Percent = (
            (this.diseaseTop1Percent * 100) /
            total
          ).toFixed(2);
          this.lstResult.push(this.diseaseTop1Percent);
          this.diseaseTop1Percent = this.diseaseTop1Percent + '%';

          this.diseaseTop2Percent = (
            (this.diseaseTop2Percent * 100) /
            total
          ).toFixed(2);
          this.lstResult.push(this.diseaseTop2Percent);
          this.diseaseTop2Percent = this.diseaseTop2Percent + '%';

          this.diseaseTop3Percent = (
            (this.diseaseTop3Percent * 100) /
            total
          ).toFixed(2);
          this.lstResult.push(this.diseaseTop3Percent);
          this.diseaseTop3Percent = this.diseaseTop3Percent + '%';

          this.diseaseTop4Percent = (
            (this.diseaseTop4Percent * 100) /
            total
          ).toFixed(2);
          this.lstResult.push(this.diseaseTop4Percent);
          this.diseaseTop4Percent = this.diseaseTop4Percent + '%';

          this.diseaseTop5Percent = (
            (this.diseaseTop5Percent * 100) /
            total
          ).toFixed(2);
          this.lstResult.push(this.diseaseTop5Percent);
          this.diseaseTop5Percent = this.diseaseTop5Percent + '%';
          this.RadarChart();
        });
    } else {
      Swal.fire({
        title: "Can't desease prediction",
        text: 'Please add symptom to prediction',
        icon: 'warning',
      });
    }
  }

  onReset() {
    this.lstSymptoms = this.lstSymptomData;
    this.lstSymptomed = [];
    this.lstResult = [];
    this.lstDiseaseName = [];
    if (this.radarChart) {
      this.radarChart.destroy();
    }
    this.diseaseTop1Name = '';
    this.diseaseTop1Percent = '';
    this.diseaseTop2Name = '';
    this.diseaseTop2Percent = '';
    this.diseaseTop3Name = '';
    this.diseaseTop3Percent = '';
    this.diseaseTop4Name = '';
    this.diseaseTop4Percent = '';
    this.diseaseTop5Name = '';
    this.diseaseTop5Percent = '';
  }
}
