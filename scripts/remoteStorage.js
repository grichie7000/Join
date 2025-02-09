let contacts = []
const BASE_URL = "https://join-d3707-default-rtdb.europe-west1.firebasedatabase.app/";

async function onloadFunc(){
		
		let contactResponse = await fetchContacts("contacts");
	
		let contactKeysArray = Object.keys(contactResponse)
		
		for (let index = 0; index < contactKeysArray.length; index++) {
			contacts.push(
			{
				id : contactKeysArray[index],
				user : userResponse[UserKeysArray[index]],
			}
		)
		}
		
		await addEditSingleContact(contacts[5].id, {name: 'Schmand'})
		
		console.log(contacts);
		
	}
	
	async function putData(path="", data={}){
	}
	
	async function addEditSingleUser(id=55, contact={name: 'Bernhard'}){
		putData('contacts/${id}', contact);
