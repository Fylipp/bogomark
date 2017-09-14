Number.prototype.toLocaleFixed = function (digits) {
    return this.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

document.addEventListener('DOMContentLoaded', function (event) {
    var form = document.getElementById('form');
    var sizeInput = document.getElementById('input-size');
    var iterationsInput = document.getElementById('input-iterations');
    var runBtn = document.getElementById('btn-run');

    var stats = document.getElementById('stats');
    var progress = document.getElementById('progress');
    var progressPercentage = document.getElementById('progress-percentage');
    var progressText = document.getElementById('progress-text');
    var summary = document.getElementById('summary');
    var summarySize = document.getElementById('summary-size');
    var summaryAvg = document.getElementById('summary-avg');
    var summaryMin = document.getElementById('summary-min');
    var summaryMax = document.getElementById('summary-max');
    var collapseGroup = document.getElementById('collapse-group');
    var collapseBtn = document.getElementById('btn-toggle-collapse');
    var table = document.getElementById('individual-content');

    var csvLink = document.getElementById('csv');

    collapseBtn.onclick = function () {
        var collapsed = collapseGroup.getAttribute('data-collapsed') !== '0';
        collapseGroup.setAttribute('data-collapsed', collapsed ? '0' : '1');
    };

    runBtn.onclick = function () {
        var size = sizeInput.value;
        var iterations = iterationsInput.value;

        try {
            size = parseInt(size);
            iterations = parseInt(iterations);
        } catch (e) {
            alert("The size and amount of iterations must be whole integers");
            return;
        }

        if (size <= 0) {
            alert("The size must be at least 1");
            return;
        }

        if (iterations <= 0) {
            alert("The amount of iterations must be at least 1");
            return;
        }

        form.classList.add('hide');
        progress.classList.remove('hide');
        stats.classList.remove('hide');

        var statMsLow = Number.MAX_VALUE;
        var statMsHigh = 0;
        var statMsSum = 0;

        var statStepsLow = Number.MAX_VALUE;
        var statStepsHigh = 0;
        var statStepsSum = 0;

        var i = 0;
        var data = [
            ['Iteration', 'Time', 'Steps'].join(';')
        ];

        function benchmark() {
            if (i === iterations) {
                summarySize.innerText = size + ' (x ' + iterations + ')';
                summaryMin.innerText = statMsLow + ' ms / ' + statStepsLow.toLocaleString() + " steps";
                summaryMax.innerText = statMsHigh + ' ms / ' + statStepsHigh.toLocaleString() + " steps";
                summaryAvg.innerText = (statMsSum / iterations).toLocaleFixed(2) + ' ms / ' + (statStepsSum / iterations).toLocaleFixed(2) + " steps";
                progress.classList.add('hide');
                summary.classList.remove('hide');

                csvLink.href = 'data:attachment/csv,' + encodeURIComponent(data.join('\n'));
                csvLink.download = 'bogomark.csv';

                return;
            }

            var row = addTableRow(i + 1);

            progressPercentage.innerText = Math.floor((i + 1) / iterations * 100) + '%';
            progressText.innerText = 'Iteration ' + (i + 1) + ' of ' + iterations;

            setTimeout(function () {
                var benchmarkTimer = timer();
                var steps = bogosort(randomArray(size));
                var time = benchmarkTimer.stop();
                row.setTime(time);
                row.setSteps(steps);

                if (time > statMsHigh) {
                    statMsHigh = time;
                }

                if (time < statMsLow) {
                    statMsLow = time;
                }

                statMsSum += time;

                if (steps > statStepsHigh) {
                    statStepsHigh = steps;
                }

                if (steps < statStepsLow) {
                    statStepsLow = steps;
                }

                statStepsSum += steps;

                data.push([i + 1, time, steps].join(';'));

                i++;
                setTimeout(benchmark, 0);
            }, 0);
        }

        benchmark();
    };

    function addTableRow(iteration) {
        var tableRow = document.createElement('tr');
        table.appendChild(tableRow);

        var iterationData = document.createElement('td');
        iterationData.innerText = iteration;
        tableRow.appendChild(iterationData);

        var timeData = document.createElement('td');
        timeData.innerText = '...';
        tableRow.appendChild(timeData);

        var stepsData = document.createElement('td');
        stepsData.classList.add('right-aligned');
        stepsData.innerText = '...';
        tableRow.appendChild(stepsData);

        return {
            setTime: function (time) {
                timeData.innerText = time;
            },
            setSteps: function (steps) {
                stepsData.innerText = steps.toLocaleString();
            }
        };
    }
});

function timer() {
    var start = new Date();

    return {
        stop: function () {
            return new Date().getTime() - start.getTime();
        }
    };
}

function randomArray(length) {
    var array = [];

    for (var i = 0; i < length; i++) {
        array.push(Math.random());
    }

    return array;
}

function bogosort(array) {
    var steps = 0;

    while (!isSorted(array)) {
        steps++;

        var index1 = randomIndex(array);
        var index2 = randomIndex(array);

        var tmp = array[index1];
        array[index1] = array[index2];
        array[index2] = tmp;
    }

    return steps;
}

function isSorted(array) {
    var last;

    for (var i = 0; i < array.length; i++) {
        var current = array[i];

        if (typeof last !== "undefined") {
            if (current < last) {
                return false;
            }
        }

        last = current;
    }

    return true;
}

function randomIndex(array) {
    return Math.floor(Math.random() * array.length);
}
