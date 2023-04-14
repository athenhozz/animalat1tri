import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

type Animal = {
  nome: string,
  pelo: boolean,
  voa: boolean,
  patas: number,
  domestico: boolean,
  grande: boolean,
  mamifero: boolean,
}

const ANIMAIS: Animal[] = [
  {
    nome: 'babuino',
    pelo: true,
    voa: false,
    patas: 4,
    domestico: false,
    grande: false,
    mamifero: true,
  },
  {
    nome: 'ganso',
    pelo: false,
    voa: false,
    patas: 2,
    domestico: false,
    grande: false,
    mamifero: false,
  },
  {
    nome: 'tucano',
    pelo: false,
    voa: true,
    patas: 2,
    domestico: false,
    grande: false,
    mamifero: false,
  },
  {
    nome: 'vira-lata(cachorro)',
    pelo: true,
    voa: false,
    patas: 4,
    domestico: true,
    grande: false,
    mamifero: true,
  },
  {
    nome: 'jaguatirica',
    pelo: true,
    voa: false,
    patas: 4,
    domestico: true,
    grande: false,
    mamifero: true,
  },
  {
    nome: 'foca',
    pelo: false,
    voa: false,
    patas: 4,
    domestico: false,
    grande: true,
    mamifero: true,
  },
];

const temPelo = (animais: Animal[], sim: boolean) => {
  return animais.filter(animal => animal.pelo === sim);
}

const animalVoa = (animais: Animal[], sim: boolean) => {
  return animais.filter(animal => animal.voa === sim);
}

const tem4Patas = (animais: Animal[], sim: boolean) => {
  const patas = sim
    ? 4
    : 2;

  return animais.filter(animal => animal.patas === patas);
}

const animalDomestico = (animais: Animal[], sim: boolean) => {
  return animais.filter(animal => animal.domestico === sim);
}

const animalGrande = (animais: Animal[], sim: boolean) => {
  return animais.filter(animal => animal.grande === sim);
}

const animalMamifero = (animais: Animal[], sim: boolean) => {
  return animais.filter(animal => animal.mamifero === sim);
}

const PERGUNTAS = new Map<string, (animais: Animal[], sim: boolean) => Animal[]>([
  ['Tem pelo?', temPelo],
  ['Voa?', animalVoa],
  ['Tem 4 patas?', tem4Patas],
  ['É doméstico?', animalDomestico],
  ['É grande?', animalGrande],
  ['É mamifero?', animalMamifero],
]);

const sorteiaPergunta = (possiveisPerguntas: string[]) => {
  const index = Math.floor(Math.random() * possiveisPerguntas.length);

  const pergunta = possiveisPerguntas[index]

  possiveisPerguntas.splice(index, 1)

  return {
    pergunta: pergunta,
    possiveisPerguntas: possiveisPerguntas
  };
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  constructor() {}


  animais$ = new BehaviorSubject<Animal[]>([]);
  perguntas$ = new BehaviorSubject<string[]>([]);
  pergunta$ = new BehaviorSubject<string>('');
  resultado$ = new BehaviorSubject<Animal | null>(null);

  private perguntaAnimal$ = new BehaviorSubject<Animal | null>(null);
  private possiveisAnimais$ = new BehaviorSubject<Animal[]>([]);
  private possiveisPerguntas$ = new BehaviorSubject<string[]>([]);

  public responder = (sim: boolean) => {
    const handler = PERGUNTAS.get(this.pergunta$.getValue());

    if (!handler) {

      if (sim) {
        this.escolheResultado();
      } else {
        this.sorteiaAnimal();
      }

      return;
    }

    this.possiveisAnimais$.next(handler(this.possiveisAnimais$.getValue(), sim));

    if (!this.verificaIguais()) {
      this.proximaPergunta();
      return;
    }

    if (this.possiveisAnimais$.getValue().length > 1) {
      this.sorteiaAnimal();
      return;
    }

    this.escolheResultado();
  }

  private escolheResultado = () => {
    const animal = this.perguntaAnimal$.getValue() === null
      ? this.possiveisAnimais$.getValue()[0]
      : this.perguntaAnimal$.getValue()

    this.resultado$.next(animal);
  };

  private sorteiaAnimal = () => {
    let possiveisAnimais = this.possiveisAnimais$.getValue();

    const index = Math.floor(Math.random() * possiveisAnimais.length);

    const animal = possiveisAnimais[index];

    possiveisAnimais.splice(index, 1)

    this.perguntaAnimal$.next(animal);
    this.possiveisAnimais$.next(possiveisAnimais);

    this.pergunta$.next(`É ${animal.nome}?`);
  }

  private objectsEqual = (o1: object, o2: object) => {
    return JSON.stringify(o1) === JSON.stringify(o2);
  }


  private verificaIguais = () => {
    const animais = this.possiveisAnimais$.getValue().map((animal) => ({
      pelo: animal.pelo,
      voa: animal.voa,
      patas: animal.patas,
      domestico: animal.domestico,
      grande: animal.grande,
      mamifero: animal.mamifero,
    }));

    return animais.every((val, _, arr) => this.objectsEqual(val, arr[0]))
  }

  private proximaPergunta = () => {
    const { pergunta, possiveisPerguntas } = sorteiaPergunta(this.possiveisPerguntas$.getValue())

    this.pergunta$.next(pergunta);
    this.possiveisPerguntas$.next(possiveisPerguntas);
  }

  public reiniciar = () => {
    this.perguntaAnimal$.next(null);
    this.resultado$.next(null);

    this.possiveisAnimais$.next(ANIMAIS);
    this.possiveisPerguntas$.next([...PERGUNTAS.keys()])

    this.proximaPergunta();
  }

  ngOnInit() {

    this.animais$.next(ANIMAIS);
    this.perguntas$.next([...PERGUNTAS.keys()])

    this.reiniciar();
  }
}
