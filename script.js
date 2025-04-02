document.addEventListener('DOMContentLoaded', () => {
    // 游戏状态变量
    let cards = [];
    let selectedCards = [];
    let selectedCardElements = [];
    let expression = [];
    let expressionStr = '';
    
    // DOM元素
    const cardsContainer = document.getElementById('cards-container');
    const expressionElement = document.getElementById('expression');
    const resultContainer = document.getElementById('result-container');
    const resetBtn = document.getElementById('reset-btn');
    const newGameBtn = document.getElementById('new-game-btn');
    const operators = document.querySelectorAll('.operator');
    
    // 扑克牌花色
    const suits = {
        'heart': '♥',
        'diamond': '♦',
        'spade': '♠',
        'club': '♣'
    };
    
    // 初始化游戏
    initGame();
    
    // 初始化游戏函数
    function initGame() {
        // 清空状态
        cards = [];
        selectedCards = [];
        selectedCardElements = [];
        expression = [];
        expressionStr = '请选择牌和运算符';
        expressionElement.textContent = expressionStr;
        cardsContainer.innerHTML = '';
        resultContainer.innerHTML = '';
        resultContainer.className = 'result-container';
        
        // 生成4张随机牌
        generateRandomCards();
        
        // 保存初始牌组的深拷贝
        initialCards = JSON.parse(JSON.stringify(cards));
        
        // 渲染牌
        renderCards();
    }
    
    // 生成随机牌
    function generateRandomCards() {
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const suitKeys = Object.keys(suits);
        
        // 生成4张不重复的牌
        while (cards.length < 4) {
            const randomValue = values[Math.floor(Math.random() * values.length)];
            const randomSuit = suitKeys[Math.floor(Math.random() * suitKeys.length)];
            
            // 检查是否已经存在相同的牌
            const exists = cards.some(card => card.value === randomValue && card.suit === randomSuit);
            
            if (!exists) {
                cards.push({
                    value: randomValue,
                    suit: randomSuit,
                    numericValue: getNumericValue(randomValue),
                    used: false
                });
            }
        }
    }
    
    // 获取牌的数值
    function getNumericValue(value) {
        if (value === 'A') return 1;
        if (value === 'J') return 11;
        if (value === 'Q') return 12;
        if (value === 'K') return 13;
        return parseInt(value);
    }
    
    // 渲染牌
    function renderCards() {
        cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.dataset.index = index;
            
            const valueElement = document.createElement('div');
            valueElement.className = 'card-value';
            valueElement.textContent = card.value;
            
            const suitElement = document.createElement('div');
            suitElement.className = `card-suit ${card.suit}`;
            suitElement.textContent = suits[card.suit];
            
            cardElement.appendChild(valueElement);
            cardElement.appendChild(suitElement);
            
            // 添加点击事件
            cardElement.addEventListener('click', () => handleCardClick(cardElement, index));
            
            cardsContainer.appendChild(cardElement);
        });
    }
    
    // 处理牌的点击事件
    function handleCardClick(cardElement, index) {
        // 如果牌已经被使用，则不做任何操作
        if (cards[index].used) return;
        console.log(expression.length)
        // 如果表达式已经包含了两个数字和一个运算符，则不能再添加数字
        if (expression.length === 3) return;
        
        // 如果表达式为空或最后一个元素是运算符，直接添加数字
        if (expression.length === 0 || typeof expression[expression.length - 1] !== 'number') {
            // 标记牌为已选择
            cardElement.classList.add('selected');
            selectedCardElements.push(cardElement);
            
            // 标记牌为已使用
            cards[index].used = true;
            
            // 将牌的数值添加到表达式中
            expression.push(cards[index].numericValue);
            selectedCards.push(index);
        } 
        // 如果表达式的最后一个元素是数字，则替换最后一个数字
        else if (typeof expression[expression.length - 1] === 'number') {
            // 恢复上一张牌的状态
            const lastCardIndex = selectedCards[selectedCards.length - 1];
            cards[lastCardIndex].used = false;
            selectedCardElements[selectedCardElements.length - 1].classList.remove('selected');
            
            // 移除上一张牌的信息
            selectedCards.pop();
            selectedCardElements.pop();
            expression.pop();
            
            // 标记新牌为已选择
            cardElement.classList.add('selected');
            selectedCardElements.push(cardElement);
            
            // 标记新牌为已使用
            cards[index].used = true;
            
            // 将新牌的数值添加到表达式中
            expression.push(cards[index].numericValue);
            selectedCards.push(index);
        }
        
        // 更新表达式显示
        updateExpressionDisplay();
        
        // 如果表达式已完成（数字-运算符-数字），自动计算结果
        if (expression.length === 3) {
            checkResult();
        }
    }
    
    // 处理运算符点击事件
    operators.forEach(operator => {
        operator.addEventListener('click', () => {
            // 获取运算符
            let op;
            switch (operator.id) {
                case 'add': op = '+'; break;
                case 'subtract': op = '-'; break;
                case 'multiply': op = '*'; break;
                case 'divide': op = '/'; break;
            }

            if(expression.length == 0) return
            

            // 如果表达式中已经有运算符，则替换它
            if (expression.length === 2) {
                expression[1] = op;
                
            } else {
                expression.push(op);
            }
            updateExpressionDisplay();

            // 如果表达式为空或者最后一个元素不是数字，则不能添加运算符
            if (expression.length === 0 || typeof expression[expression.length - 1] !== 'number') return;
            
            // 如果表达式长度为3，说明已经完成一次计算，不能添加运算符
            if (expression.length === 3) return;
            
            
            // 更新表达式显示
            updateExpressionDisplay();
        });
    });
    
    // 更新表达式显示
    function updateExpressionDisplay() {
        if (expression.length === 0) {
            expressionStr = '请选择牌和运算符';
        } else {
            expressionStr = expression.map(item => {
                if (item === '*') return '×';
                if (item === '/') return '÷';
                return item;
            }).join(' ');
        }
        
        expressionElement.textContent = expressionStr;
    }
    
    // 计算表达式结果
    function calculateExpression() {
        if (expression.length !== 3) return null;
        
        const num1 = expression[0];
        const operator = expression[1];
        const num2 = expression[2];
        
        let result;
        switch (operator) {
            case '+':
                result = num1 + num2;
                break;
            case '-':
                result = num1 - num2;
                break;
            case '*':
                result = num1 * num2;
                break;
            case '/':
                // 检查除数是否为0
                if (num2 === 0) return null;
                result = num1 / num2;
                break;
            default:
                return null;
        }
        
        return result;
    }
    
    // 重置当前表达式
    function resetExpression() {
        // 清除选中状态
        selectedCardElements.forEach(cardElement => {
            cardElement.classList.remove('selected');
        });
        
        // 重置牌的使用状态
        selectedCards.forEach(index => {
            cards[index].used = false;
        });
        
        // 恢复到初始牌组状态
        cards = JSON.parse(JSON.stringify(initialCards));
        
        // 清空所有状态
        selectedCards = [];
        selectedCardElements = [];
        expression = [];
        expressionStr = '请选择牌和运算符';
        
        // 更新表达式显示
        expressionElement.textContent = expressionStr;
        
        // 清空结果
        resultContainer.innerHTML = '';
        resultContainer.className = 'result-container';
        
        // 重新渲染牌
        cardsContainer.innerHTML = '';
        renderCards();
    }
    
    // 用计算结果替换原来的两张牌
    function replaceCardsWithResult(result) {
        // 移除原来的两张牌
        const firstCardIndex = selectedCards[0];
        const secondCardIndex = selectedCards[1];
        
        // 从DOM中移除这两张牌
        const cardElements = document.querySelectorAll('.card');
        cardElements[firstCardIndex].remove();
        // 由于移除了一个元素，第二张牌的索引需要调整
        const adjustedSecondIndex = secondCardIndex > firstCardIndex ? secondCardIndex - 1 : secondCardIndex;
        cardElements[adjustedSecondIndex].remove();
        
        // 从cards数组中移除这两张牌
        cards.splice(firstCardIndex, 1);
        const adjustedSecondCardIndex = secondCardIndex > firstCardIndex ? secondCardIndex - 1 : secondCardIndex;
        cards.splice(adjustedSecondCardIndex, 1);
        
        // 创建新的结果牌
        const resultCard = {
            value: result.toString(),
            suit: 'heart', // 默认使用红心
            numericValue: result,
            used: false
        };
        
        // 添加到cards数组
        cards.push(resultCard);
        
        // 重新渲染所有牌
        cardsContainer.innerHTML = '';
        renderCards();
        
        // 清空表达式和选择状态
        selectedCards = [];
        selectedCardElements = [];
        expression = [];
        updateExpressionDisplay();
    }
    
    // 检查是否达到24点
    function checkResult() {
        const result = calculateExpression();
        
        if (result === null) {
            showResult('表达式无效', false);
            return;
        }
        
        // 显示计算结果
        const calculationStr = `${expression[0]} ${expression[1] === '*' ? '×' : expression[1] === '/' ? '÷' : expression[1]} ${expression[2]} = ${result}`;
        showResult(calculationStr, true);
        
        // 用计算结果替换原来的两张牌
        replaceCardsWithResult(result);
    }
    
    // 显示结果
    function showResult(message, isSuccess) {
        resultContainer.textContent = message;
        resultContainer.className = `result-container ${isSuccess ? 'success' : 'error'}`;
    }
    
    // 重置按钮事件
    resetBtn.addEventListener('click', resetExpression);
    
    // 提交按钮事件
    // submitBtn.addEventListener('click', checkResult);  // 删除这行
    
    // 新游戏按钮事件
    newGameBtn.addEventListener('click', initGame);
});