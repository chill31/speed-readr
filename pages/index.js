import Head from 'next/head'
import { useEffect, useState } from 'react'

import { SlControlPlay } from 'react-icons/sl'
import { BsPlusLg, BsCheckLg, BsTrash, BsXLg } from 'react-icons/bs'

import randomWords from 'random-words'

export default function Home() {

  const defaults = [
    {
      test: "Level 1",
      edit: false,
      words: 100,
      defaults: true
    },
    {
      test: "Level 2",
      edit: false,
      words: 200,
      defaults: true
    },
    {
      test: "Level 3",
      edit: false,
      words: 350,
      defaults: true
    },
    {
      test: "Level 4",
      edit: false,
      words: 500,
      defaults: true
    },
    {
      test: "Level 5",
      edit: false,
      words: 750,
      defaults: true
    }
  ];

  const [data, setData] = useState([]);
  const [newTestModalVisible, setNewTestModalVisible] = useState(false);
  const [testModalVisible, setTestModalVisible] = useState(false);

  const openNewTestModal = () => setNewTestModalVisible(true);
  const closeNewTestModal = () => setNewTestModalVisible(false);

  const openTestModal = () => {
    setTestModalVisible(true);
  };
  const closeTestModal = () => {
    setTestModalVisible(false);
  };

  function generateSentence(wordCount) {
    const words = randomWords({ exactly: wordCount });
    // Capitalize the first word
    words[0] = words[0][0].toUpperCase() + words[0].substr(1);
    // Add a period at the end
    words[wordCount - 1] += ".";
    return words.join(" ");
  }

  function createNewTest() {
    let newData = [...data];

    const input = document.getElementById("new-test-input");
    const words = document.getElementById("new-test-word-input");

    const val = words.value;
    const numericInput = val.replace(/[^0-9]/g, "");

    newData.push({ test: input.value, edit: true, words: Number(numericInput), defaults: false });

    localStorage.setItem("reading-tests", JSON.stringify(newData));
    setData(newData);
    closeNewTestModal();
  }

  function deleteTest(index) {
    let newData = [];

    for (let i = 0; i < data.length; i++) {
      if (i === index) {
        continue;
      } else {
        newData.push(data[i]);
      }
    }

    setData(newData);
    localStorage.setItem("reading-tests", JSON.stringify(newData));
  }

  let intervals = [];
  function startTest(level, words) {
    openTestModal();

    const screen = document.getElementById("test-screen");
    const testLevel = document.getElementById("test-level");

    testLevel.textContent = `${level} : ${words} words / minute`;

    const close = document.getElementById("close-test-modal");
    close.addEventListener("click", () => {
      closeTestModal();
      intervals.forEach((interval) => clearInterval(interval));
    });

    let count = 3;
    screen.textContent = count;
    const counterInterval = setInterval(() => {
      count--
      if (count === 0) {
        showWords(screen, words, testLevel);
        clearInterval(counterInterval);
      } else {
        screen.textContent = count;
      }
    }, 1000);
    intervals.push(counterInterval);
  }

  function showWords(screen, words) {

    const wordsList = generateSentence(75).split(" ");
    const intervalMilliSeconds = 60 / words * 1000;

    let wordCount = 0;
    screen.textContent = wordsList[wordCount];
    const wordInterval = setInterval(() => {
      wordCount++

      if (wordCount >= wordsList.length) {
        screen.textContent = "Test Finished."

        setTimeout(() => {
          closeTestModal();
          clearInterval(wordInterval);
        }, 3000);
      } else {
        screen.textContent = wordsList[wordCount];
      }
    }, intervalMilliSeconds);
    intervals.push(wordInterval);

  }

  useEffect(() => {

    if (!localStorage.getItem("reading-tests")) {
      localStorage.setItem("reading-tests", JSON.stringify(defaults));
    }

    setData(JSON.parse(localStorage.getItem("reading-tests")));

    document.getElementById("modal-bg").addEventListener("click", (e) => {
      if (e.target.id === 'modal-bg') closeNewTestModal();
    });

    addEventListener("keydown", (e) => {
      if (e.key === 'Escape') {
        closeNewTestModal();
      };
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Head>
        <title>Speed Readr</title>
        <meta name="description" content="Test your reading speed with customised levels and tests" />
      </Head>

      <main className='flex flex-col gap-12 place-items-center'>
        <h1 className='text-center font-extralight text-7xl mt-10'>Speed Readr</h1>

        <button className='py-4 px-6 text-2xl mt-4 bg-black w-fit text-center rounded-md text-white hover:bg-white hover:text-black hover:border-black border-transparent border-[1px] transition-colors duration-200 shadow-lg shadow-black/50 focus:bg-white focus:text-black focus:border-black outline-none flex gap-4 items-center justify-center' onClick={openNewTestModal}><BsPlusLg /> Create New Test</button>

        <div className='flex flex-col gap-6 w-[100%] justify-center items-center pb-12'>
          {data.map((item, k) => (
            <div className={`w-[50rem] max-w-[92%] flex flex-col gap-6 pl-10 pr-28 py-20 justify-start rounded-lg relative ${item.defaults ? 'bg-zinc-300' : 'bg-cyan-200'}`} key={k}>

              <div className='flex gap-4 items-center justify-start'>
                {item.edit ? <BsTrash className='text-2xl cursor-pointer' onClick={() => deleteTest(k)} /> : ""}

                <h2 className='text-4xl'>{item.test}</h2>
              </div>
              <span className='text-left text-zinc-700 text-2xl min-w-max'>{item.defaults ? '[DEFAULT]' : ''}<br />{item.words} words / Minutes</span>
              <button className='py-4 px-6 text-xl mt-4 bg-black w-fit text-center rounded-md text-white hover:bg-white hover:text-black hover:border-black border-transparent border-[1px] transition-colors duration-200 shadow-lg shadow-black/50 focus:bg-white focus:text-black focus:border-black outline-none flex gap-2 items-center min-w-max' onClick={() => startTest(item.test, item.words)}><SlControlPlay /> Start Test</button>

            </div>
          ))}
        </div>

        <div className={`gap-10 fixed top-0 left-0 h-full w-full bg-slate-400/50 flex justify-center items-center ${newTestModalVisible ? '' : 'hidden'}`} id="modal-bg">

          <div className='flex flex-col gap-10 items-start justify-center bg-white px-14 py-16 rounded-lg max-w-[92%] w-[35rem] max-sm:px-6 max-sm:py-10'>
            <h2 className='text-4xl'>Create Test</h2>
            <input id="new-test-input" placeholder='enter test name...' className='text-lg px-4 py-3 border-black border-2 w-[30rem] max-w-[90%] outline-none focus:border-cyan-600' tabIndex="0" />
            <input id="new-test-word-input" placeholder='enter words per minute...' className='text-lg px-4 py-3 border-black border-2 w-[30rem] max-w-[90%] outline-none focus:border-cyan-600' tabIndex="0" />

            <button className='py-3 px-5 text-xl mt-4 bg-black w-fit text-center rounded-md text-white hover:bg-white hover:text-black hover:border-black border-transparent border-[1px] transition-colors duration-200 shadow-lg shadow-black/50 focus:bg-white focus:text-black focus:border-black outline-none flex gap-2 items-center min-w-max' onClick={createNewTest}><BsCheckLg /> Confirm</button>
          </div>
        </div>

        <div className={`justify-center items-center gap-8 fixed top-0 left-0 h-[100%] w-[100%] bg-slate-400/50 ${testModalVisible ? 'flex' : 'hidden'}`} id="test-modal">

          <div className='p-8 bg-white rounded-xl flex flex-col gap-8 w-[40rem] max-w-[95%]'>
            <BsXLg id="close-test-modal" className='text-2xl relative left-[95%] cursor-pointer' />

            <div id="test-screen" className='flex justify-center items-center bg-black text-[gold] text-4xl p-20'>WORD</div>
            <span className='text-slate-700 text-2xl' id="test-level"></span>

          </div>

        </div>
      </main>
    </div>
  )
}
