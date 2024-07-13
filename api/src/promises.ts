oldSchool('my-special-argument');

function oldSchool(myArgument: string) {
  talkToServer(myArgument).then(function (resultA) {
    talkToServer(resultA).then(function (resultB) {
      talkToServer(resultB).then(function (resultC) {
        talkToServer(resultC).then(function (resultD) {
          console.log(resultD);
        });
      });
    });
  });
}

// ------------------------------------------------

newSchool('my-special-argument');

async function newSchool(myArgument: string) {
  const resultA = await talkToServer(myArgument);
  const resultB = await talkToServer(resultA);
  const resultC = await talkToServer(resultB);
  const resultD = await talkToServer(resultC);
  console.log(resultD);
}

function talkToServer(myArgument: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (false) return reject('Sorry man, no idea why');

    return resolve('here is your string brother');
  });
}
