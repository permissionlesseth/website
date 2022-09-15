
const web3 = new Web3(window.ethereum);
const walletUK = document.querySelector(".web3_wallet");
const mintUKInut = document.querySelector("#form-mint-amount");
const mintUKButton = document.querySelector("#form_mint_btn");
const failResult = (message) => ({ success: false, message })// fail
const successResult = (result) => ({ success: true, result })// success
const NETWORK_ID = 1

// Examine account
if(sessionStorage.getItem('permissionless-account')) {
	const currentAccount = sessionStorage.getItem('permissionless-account')
	walletUK.innerHTML = currentAccount.slice(0, 4) + '...' + currentAccount.slice(currentAccount.length - 4, currentAccount.length);
}

// Connect Wallet
async function connectWallet(val) {
	const accounts = await ethereum.request({
		method: "eth_requestAccounts",
	});
	const account = accounts[0];
	// Execute network
	const chainId = await web3.eth.net.getId();
	if(chainId !== NETWORK_ID) return UIkit.notification("Please change your wallet network to access Main Net", { status: 'danger', timeout: 1000 })
	sessionStorage.setItem('permissionless-account', account);
	// getBalance(account)
	walletUK.innerHTML = account.slice(0, 4) + '...' + account.slice(account.length - 4, account.length);
	UIkit.modal("#uni_connect_wallet").hide();
}

// getBalance
async function getBalance(account) {
	const resp = await web3.eth.getBalance(account)
	const balance = web3.utils.fromWei(resp, "ether")
}

// Execute smart contract to mint
async function contractMint() {
	try {
		const contractInstance = new web3.eth.Contract(CONTRACT.ABI, CONTRACT.ADDRESS);
		// const account = await web3.eth.getCoinbase();
		const accounts = await ethereum.request({
			method: "eth_requestAccounts",
		});
		const account = accounts[0];
		// Execute network
		const chainId = await web3.eth.net.getId();
		if(chainId !== NETWORK_ID) return UIkit.notification("Please change your wallet network to access Main Net", { status: 'danger', timeout: 1000 })
		sessionStorage.setItem('permissionless-account', account);
		walletUK.innerHTML = account.slice(0, 4) + '...' + account.slice(account.length - 4, account.length);
		const mintAmount = mintUKInut.value
		const resp = await contractInstance.methods.getPermissionlessPic(mintAmount)
			.send({
				from: account
			})
		return successResult(resp)
	} catch (e) {
		return failResult(e)
	}
}

// Mint NFT
async function mintNFT() {
	if(!sessionStorage.getItem('permissionless-account')) return UIkit.notification("Please Connect Wallet", { status: 'danger', timeout: 1000 })
	if (!mintUKInut.value) return UIkit.notification("Please input", { status: 'danger', timeout: 1000 })
	mintUKButton.disabled = true
	const resp = await contractMint()
	mintUKButton.disabled = false
	if (!resp.success) return UIkit.notification('Mint Error', { status: 'danger', timeout: 1000 })
	UIkit.modal("#uni_mint_nft").hide();
	UIkit.notification("Mint Success", { status: 'success', timeout: 1000 })
}

// addEventListener
$('#uni_mint_nft').on({
	'show.uk.modal': function(){
		// console.log("Modal is visible.");
		mintUKInut.value = null
		mintUKButton.disabled = false
	},

	'hide.uk.modal': function(){
		// console.log("Modal is not visible.");
		mintUKInut.value = null
		mintUKButton.disabled = false
	}
});
