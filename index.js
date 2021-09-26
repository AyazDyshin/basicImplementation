import {
  getSolidDataset,
  overwriteFile,
  getFile,
} from "@inrupt/solid-client";
import { Session } from "@inrupt/solid-client-authn-browser";
import { deleteFile } from "@inrupt/solid-client";

const SOLID_IDENTITY_PROVIDER = "https://solidcommunity.net";
document.getElementById(
  "solid_identity_provider"
).innerHTML = `[<a target="_blank" href="${SOLID_IDENTITY_PROVIDER}">${SOLID_IDENTITY_PROVIDER}</a>]`;



const session = new Session();

const buttonLogin = document.getElementById("loginButton");
const writeForm = document.getElementById("writeForm");
const readForm = document.getElementById("readForm");
const deleteForm = document.getElementById("deleteForm");

// login functionality
async function login() {
  if (!session.info.isLoggedIn) {
    await session.login({
      oidcIssuer: SOLID_IDENTITY_PROVIDER,
      clientName: "Basic implementation",
      redirectUrl: window.location.href
    });
  }
}

//  Login Redirect
async function handleRedirectAfterLogin() {
  await session.handleIncomingRedirect(window.location.href);
  if (session.info.isLoggedIn) {

    document.getElementById(
      "labelStatus"
    ).innerHTML = `Your session is logged in with the WebID [<a target="_blank" href="${session.info.webId}">${session.info.webId}</a>].`;
    document.getElementById("labelStatus").setAttribute("role", "alert");
   
  }
}

handleRedirectAfterLogin();

// creating a note
async function createNote() {
  //getting content from the input text field
  const name = document.getElementById("noteText").value;
  //getting content from the note title field
  const noteTitle = document.getElementById("note_title").value;
  //check if user is authenticated
  if (!session.info.isLoggedIn) {
    document.getElementById("statusUpd").textContent = `you need to login to create a note`;
    return;
  }
  //getting current user's webid as a string
  const webID = session.info.webId;
  const profileDocumentUrl = new URL(webID);
  profileDocumentUrl.hash = "";
  const currentUser = profileDocumentUrl.host;

  //appending path where the notes will be stored
  const loc = currentUser + '/public/testfolder/';
  // fetch 
  let myProfileDataset = await getSolidDataset(profileDocumentUrl.href, {
    fetch: session.fetch
  });
  //creating full note path
  const fileName = noteTitle + '.txt';
  const finalPath = 'https://' + loc + fileName;
  // creating a note
     const savedFile = await overwriteFile(
    finalPath,
    new Blob([name], { type: "plain/text" }),
    { contentType: "text/plain", fetch: session.fetch }
  );
  document.getElementById(  
    "statusUpd"
  ).textContent = `note was successfuly created`;
}

async function readProfile() {

  if (!session.info.isLoggedIn) {
    document.getElementById("statusUpd").textContent = `you need to login to read a note`;
    return;
  }
  //getting current user's webid as a string
  const fileName = document.getElementById("readId").value;
  const webID = session.info.webId;
  const profileDocumentUrl = new URL(webID);
  profileDocumentUrl.hash = "";
  const currentUser = profileDocumentUrl.host;
  //creating full note path
  const finalUrl = 'https://'+ currentUser +'/public/testfolder/' + fileName + '.txt';
  //accessing the note
  const fileBlob = await getFile(finalUrl, { fetch: session.fetch }).catch((error) => {
    document.getElementById(
      "statusUpd"
    ).textContent = `the file you want to read does not exist`;
  });  
 
const text = await new Response(fileBlob).text();
 
document.getElementById("output").innerHTML = text;
 
}
function delFile(){
  if (!session.info.isLoggedIn) {
    document.getElementById("statusUpd").textContent = `you need to login to delete note`;
    return;
  }
  //getting current user's webid as a string
  const toDel = document.getElementById("deleteInput").value;
  const webID = session.info.webId;
   const profileDocumentUrl = new URL(webID);
  profileDocumentUrl.hash = "";
  const currentUser = profileDocumentUrl.host;

  //appending path where the notes will be stored
  const loc = currentUser + '/public/testfolder/';
  const toDelUpd = 'https://'+loc +toDel+'.txt';
  
  
  
     deleteFile(
      toDelUpd,  
      { fetch: session.fetch } 
                              
    ).catch((error) => {
      document.getElementById(
        "statusUpd"
      ).textContent = `entered file does not exist`;
    })
}
buttonLogin.onclick = function () {
  login();
};

writeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  createNote();
});

readForm.addEventListener("submit", (event) => {
  event.preventDefault();
  readProfile();
});
deleteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  delFile();
});