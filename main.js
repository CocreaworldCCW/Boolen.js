// Boolean logic functions
function NOT(a) {
    return a === 0 ? 1 : 0;
}

function AND(a, b) {
    return a === 1 && b === 1 ? 1 : 0;
}

function OR(a, b) {
    return a === 1 || b === 1 ? 1 : 0;
}

function XOR(a, b) {
    return a !== b ? 1 : 0;
}

// Function to evaluate Boolean expressions with custom functions
function evaluateExpression(expression, functions) {
    const operators = [];
    const values = [];

    function precedence(op) {
        if (op === '~') return 3;
        if (op === '&' || op === '|' || op === '^') return 2;
        return 0;
    }

    function applyOperation() {
        const op = operators.pop();
        if (op === '~') {
            const a = values.pop();
            values.push(NOT(a));
        } else {
            const b = values.pop();
            const a = values.pop();
            if (op === '&') values.push(AND(a, b));
            else if (op === '|') values.push(OR(a, b));
            else if (op === '^') values.push(XOR(a, b));
        }
    }

    function parseExpression(expression) {
        let i = 0;
        while (i < expression.length) {
            const char = expression[i];

            if (char === ' ') {
                i++;
                continue;
            }
            if (char === '(') {
                operators.push(char);
            } else if (char === ')') {
                while (operators.length && operators[operators.length - 1] !== '(') {
                    applyOperation();
                }
                operators.pop();
            } else if (char === '0' || char === '1') {
                values.push(parseInt(char));
            } else if (['&', '|', '^', '~'].includes(char)) {
                while (operators.length && precedence(operators[operators.length - 1]) >= precedence(char)) {
                    applyOperation();
                }
                operators.push(char);
            } else {
                let funcName = "";
                while (i < expression.length && /[a-zA-Z0-9]/.test(expression[i])) {
                    funcName += expression[i];
                    i++;
                }
                if (functions.hasOwnProperty(funcName)) {
                    if (expression[i] === '(') {
                        i++;
                        let nestedInput = "";
                        let balance = 1;
                        while (balance !== 0) {
                            if (expression[i] === '(') balance++;
                            if (expression[i] === ')') balance--;
                            if (balance > 0) nestedInput += expression[i];
                            i++;
                        }
                        const nestedInputValues = parseExpression(nestedInput);
                        const funcInputs = Array.isArray(nestedInputValues) ? nestedInputValues : [nestedInputValues];
                        const result = functions[funcName].evaluate(funcInputs);
                        if (result === "undefined") {
                            throw new Error(`Undefined input for function ${funcName}`);
                        }
                        values.push(parseInt(result[0]));
                    }
                    continue;
                } else {
                    throw new Error(`Function '${funcName}' is not defined.`);
                }
            }
            i++;
        }
        while (operators.length) {
            applyOperation();
        }
        return values.pop();
    }

    return parseExpression(expression);
}

// Class for defining custom Boolean functions
class CustomBooleanFunction {
    constructor(definition) {
        this.truthTable = {};
        const entries = definition.split(";");
        entries.forEach(entry => {
            const [input, output] = entry.split("=");
            this.truthTable[input.trim()] = output.trim().split(" ");
        });
    }

    evaluate(inputs) {
        const inputsStr = inputs.join("");
        return this.truthTable[inputsStr] || ["undefined"];
    }
}

// Object to store custom functions
const functions = {};

// Define function dynamically
function defineFunction(name, definition) {
    functions[name] = new CustomBooleanFunction(definition);
}

// Event listener for Calculate button
document.getElementById('calculate').addEventListener('click', () => {
    const expression = document.getElementById('expression').value;
    try {
        const result = evaluateExpression(expression, functions);
        document.getElementById('result').textContent = `Result: ${result}`;
    } catch (error) {
        document.getElementById('result').textContent = `Error: ${error.message}`;
    }
});

// Event listener for Define Function button
document.getElementById('defineFunction').addEventListener('click', () => {
    const functionName = document.getElementById('functionName').value.trim();
    const truthTable = document.getElementById('truthTable').value.trim();
    if (functionName && truthTable) {
        try {
            defineFunction(functionName, truthTable);
            document.getElementById('defineResult').textContent = `Function '${functionName}' defined successfully!`;
        } catch (error) {
            document.getElementById('defineResult').textContent = `Error defining function: ${error.message}`;
        }
    } else {
        document.getElementById('defineResult').textContent = 'Please enter both function name and truth table.';
    }
});
