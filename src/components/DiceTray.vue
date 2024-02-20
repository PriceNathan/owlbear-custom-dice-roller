<script>
import OBR from "@owlbear-rodeo/sdk";
import {DiceRoller} from "@dice-roller/rpg-dice-roller";

const systemDice = {
  "DCC": [3, 4, 5, 6, 7, 8, 10, 12, 14, 16, 20, 24, 30, 100],
  "D&D": [4, 6, 8, 10, 12, 20, 100],
}

export default {
  name: "DiceTray",
  props: {
    //
  },
  data() {
    return {
      roller: {},
      player: null,
      rolls: [],
      system: null,
      diceTray: [],
      toggleDiceSelection: false,
    };
  },
  async created () {
    OBR.onReady(() => {
      this.getPlayerInfo();
    });
    this.roller = new DiceRoller();
    this.createDice();
  },
  computed: {
    systems() {
      return Object.keys(systemDice);
    },
    hasDiceSelected() {
      return this.diceTray.some((die) => die.count > 0);
    },
  },
  methods: {
    createDice() {
      //foreach die, create an object with the die value and count
      this.diceTray =  systemDice[this.system].map((die) => {
        return {
          value: die,
          count: 0,
          show: true,
        }
      });
    },
    async getPlayerInfo() {
      const playerInstance = OBR.player;
      const name = await playerInstance.getName();
      const role = await playerInstance.getRole();
      const id = await playerInstance.getId();

      this.player = {
        name,
        role,
        id,
      }
    },
    rollDice() {
      this.resetRolls();
      //roll all dice selected and return results, as sum and individual dice
      //for each die type, make the rolls and add to the rolls array
      this.diceTray.forEach((die) => {
        if(die.count > 0){
          let roll = this.roller.roll(`${die.count}d${die.value}`);
          this.rolls.push({
            dice: `d${die.value}`,
            total: roll.total,
            output: roll.output,
          });
        }
      });
      this.notify();
      this.resetDice();
    },
    resetDice() {
      this.diceTray.forEach((die) => {
        die.count = 0;
      });
    },
    resetRolls() {
      this.rolls = [];
    },
    notify() {
      //set playername to that of player if set, otherwise to PLAYER
      let playerName = this.player ? this.player.name : "PLAYER";
      //sum the totals for each roll
      //combine roll totals, and output roll totals and each roll's output
      let total = this.rolls.reduce((acc, roll) => acc + roll.total, 0);
      let totalMessage = `${playerName} rolled a ${total}!`;

      //combine all the roll outputs, separated by a line break
      let output = this.rolls.map((roll) => roll.output).join("\n");

      let message = `${totalMessage}\n${output}`;
      //log total message and output to console, separated by line break
      console.log(message);

      try{
        OBR.notification.show(message);
      } catch (e) {
        console.log(e);
      }
    },
  }
}
</script>

<template>
<div class="container-sm">
  <div class="">
    Custom Dice Roller
  </div>
  <div class="options py-4">
    <div v-if="toggleDiceSelection">
      <!-- dropdown for system selection -->
      <select v-model="system"  v-on:change="createDice">
        <!-- label for system selection -->
        <option v-for="system in systems" :value="system">{{system}}</option>
      </select>
    </div>
    <div class="mx-auto">
      <button class="btn" @click="toggleDiceSelection = !toggleDiceSelection">Select Dice</button>
    </div>
  </div>

  <!-- dice tray -->
  <div >
    <div class="flex flex-wrap">
      <div v-for="die in diceTray" :class="{'w-1/2': (die.show && !toggleDiceSelection) || toggleDiceSelection}">
        <div v-if="toggleDiceSelection" >
          <button class="btn" @click="die.show = !die.show"  :class="{ 'show': die.show, 'hide': !die.show }">d{{die.value}}</button>
        </div>
        <div v-else-if="die.show && !toggleDiceSelection">
          <button class="btn" @click="die.count++" @click.right.prevent="die.count > 0 ? die.count-- : null">d{{die.value}}: {{die.count}}</button>
        </div>
      </div>
    </div>

    <button v-if="!toggleDiceSelection" @click="rollDice" :disabled="!hasDiceSelected">Roll</button>
  </div>



</div>
</template>

<style scoped>
.show{
  background-color: green;
}

.hide{
  background-color: red;
}

.btn{
  margin: 0.5em;
  padding: 0.5em;
  border-radius: 8px;
  border: 2px solid black;
  cursor: pointer;
}
</style>