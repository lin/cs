translate_to_undecidable_FOL_formula = function (machine) {
  machine_FOL_formula = translate_machine_to_FOL_formula(machine) // A(M)
  return 'Eu.' + machine_FOL_formula + ' -> Es.Et.R_0{s,t}' // Un(M) in P268
}

is_formula_provable = function (formula) {
  return true_when_is_provable // some magic procedure that's not possible
}

whether_ever_print_zero = function (machine) {
  undecidable_FOL_formula = translate_to_undecidable_FOL_formula(machine) // Eu.A(M) -> Es.Et.R_0{s,t}
  if (is_formula_provable(undecidable_FOL_formula)) {
    // This result is unacceptable.
    console.log('This machine prints some zero!')
  } else {
    // is_formula_provable can return false for this machine.
    // this machine can also prints some zero.
    // We have to prove that when the machine is not provable. It will never print zero
    // Which is the same as when it prints zero, this machine is provable, which Turing proved.
    // Then a false means no zero in the machine. 
    // which is also unacceptable.
    console.log('This machine prints no zero!')
  }
}