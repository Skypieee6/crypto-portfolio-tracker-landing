
// Crypto Portfolio Tracker - Live Data Integration
const CRYPTO_API = 'https://api.coingecko.com/api/v3';

async function fetchCryptoData() {
    try {
        const coins = ['bitcoin', 'ethereum', 'solana'];
        const data = [];
        
        for (const coin of coins) {
            const priceResponse = await fetch(`${CRYPTO_API}/simple/price?ids=${coin}&vs_currencies=usd`);
            const priceData = await priceResponse.json();
            const currentPrice = priceData[coin].usd;
            
            const histResponse = await fetch(`${CRYPTO_API}/coins/${coin}/market_chart?vs_currency=usd&days=7`);
            const histData = await histResponse.json();
            const prices = histData.prices.map(p => p[1]);
            const movingAvg = prices.reduce((a, b) => a + b, 0) / prices.length;
            const changePct = ((currentPrice - movingAvg) / movingAvg) * 100;
            
            data.push({
                id: coin,
                symbol: coin.toUpperCase(),
                name: coin.charAt(0).toUpperCase() + coin.slice(1),
                currentPrice,
                movingAvg,
                changePct,
                status: currentPrice > movingAvg ? 'bullish' : 'bearish'
            });
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching crypto data:', error);
        return [];
    }
}

function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(price);
}

function formatChange(change) {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
}

function getStatusColor(status) {
    return status === 'bullish' ? '#10b981' : '#ef4444';
}

async function updateTicker() {
    const data = await fetchCryptoData();
    const tickerContainer = document.querySelector('.ticker-grid');
    
    if (!tickerContainer) return;
    
    tickerContainer.innerHTML = '';
    
    data.forEach(coin => {
        const card = document.createElement('div');
        card.className = 'ticker-card';
        card.innerHTML = `
            <div class="ticker-header">
                <span class="ticker-symbol">${coin.symbol}</span>
                <span class="ticker-status ${coin.status}">${coin.status === 'bullish' ? 'BULLISH' : 'BEARISH'}</span>
            </div>
            <div class="ticker-price">${formatPrice(coin.currentPrice)}</div>
            <div class="ticker-change">
                <span style="color: ${getStatusColor(coin.status)}">
                    ${formatChange(coin.changePct)}
                </span> vs 7-day average
            </div>
        `;
        tickerContainer.appendChild(card);
    });
}

// Initialize
updateTicker();
setInterval(updateTicker, 60000);

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
