/**
 * Wallet Management Component
 * Handles wallet balance, transactions, and withdrawal functionality
 */

class WalletManagement {
  constructor() {
    this.walletData = {
      availableBalance: 0,
      pendingBalance: 0,
      totalEarnings: 0,
      totalWithdrawals: 0,
      currency: 'INR'
    };
    this.transactions = [];
    this.withdrawals = [];
    this.currentPage = 1;
    this.transactionFilters = {
      type: '',
      status: ''
    };
  }

  /**
   * Initialize the wallet management interface
   */
  async init() {
    try {
      await this.loadWalletData();
      await this.loadTransactions();
      await this.loadWithdrawals();
      this.render();
      this.bindEvents();
    } catch (error) {
      console.error('Failed to initialize wallet management:', error);
      this.renderError();
    }
  }

  /**
   * Load wallet data from API
   */
  async loadWalletData() {
    try {
      const response = await window.apiClient.getWalletInfo();
      if (response.success && response.data) {
        this.walletData = response.data;
      }
    } catch (error) {
      console.error('Failed to load wallet data:', error);
      // Use mock data for development
      this.walletData = {
        availableBalance: 15420.50,
        pendingBalance: 2340.00,
        totalEarnings: 18760.50,
        totalWithdrawals: 1000.00,
        currency: 'INR',
        recentTransactions: 12
      };
    }
  }

  /**
   * Load transaction history
   */
  async loadTransactions(page = 1) {
    try {
      const params = {
        page,
        limit: 10,
        ...this.transactionFilters
      };
      
      const response = await window.apiClient.getTransactions(params);
      if (response.success && response.data) {
        this.transactions = response.data.transactions || [];
        this.pagination = response.data.pagination || {};
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
      // Mock transaction data
      this.transactions = [
        {
          transactionId: '1',
          type: 'tournament_payout',
          amount: 5000,
          description: 'Tournament payout - BGMI Championship',
          status: 'completed',
          createdAt: '2025-01-15T10:30:00Z'
        },
        {
          transactionId: '2',
          type: 'withdrawal',
          amount: -1000,
          description: 'Withdrawal request - Bank Transfer',
          status: 'completed',
          createdAt: '2025-01-10T14:20:00Z'
        }
      ];
    }
  }

  /**
   * Load withdrawal requests
   */
  async loadWithdrawals() {
    try {
      const response = await window.apiClient.get('/api/host/wallet/withdrawals');
      if (response.success && response.data) {
        this.withdrawals = response.data.withdrawals || [];
      }
    } catch (error) {
      console.error('Failed to load withdrawals:', error);
      // Mock withdrawal data
      this.withdrawals = [
        {
          withdrawalId: '1',
          amount: 2340,
          status: 'pending',
          paymentMethod: 'bank_transfer',
          requestedAt: '2025-01-18T09:15:00Z'
        }
      ];
    }
  }

  /**
   * Render the wallet management interface
   */
  render() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
      <div class="animate-fade-in space-y-6">
        <!-- Wallet Balance Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          ${this.renderBalanceCard('Available Balance', this.walletData.availableBalance, 'fas fa-wallet', 'green-400', true)}
          ${this.renderBalanceCard('Pending Balance', this.walletData.pendingBalance, 'fas fa-clock', 'yellow-400')}
          ${this.renderBalanceCard('Total Earnings', this.walletData.totalEarnings, 'fas fa-chart-line', 'cyber-cyan')}
          ${this.renderBalanceCard('Total Withdrawals', this.walletData.totalWithdrawals, 'fas fa-arrow-down', 'red-400')}
        </div>

        <!-- Quick Actions -->
        <div class="glass rounded-xl p-6">
          <h3 class="text-lg font-semibold mb-4 text-starlight">Quick Actions</h3>
          <div class="flex flex-wrap gap-4">
            <button id="withdraw-btn" class="btn-primary flex items-center space-x-2">
              <i class="fas fa-money-bill-wave"></i>
              <span>Request Withdrawal</span>
            </button>
            <button id="refresh-wallet" class="btn-secondary flex items-center space-x-2">
              <i class="fas fa-sync-alt"></i>
              <span>Refresh Balance</span>
            </button>
          </div>
        </div>

        <!-- Tabs for Transactions and Withdrawals -->
        <div class="glass rounded-xl overflow-hidden">
          <div class="border-b border-cyber-border">
            <nav class="flex space-x-8 px-6">
              <button class="wallet-tab active py-4 px-2 border-b-2 border-cyber-cyan text-cyber-cyan font-medium" data-tab="transactions">
                Transactions
              </button>
              <button class="wallet-tab py-4 px-2 border-b-2 border-transparent text-starlight-muted hover:text-starlight font-medium" data-tab="withdrawals">
                Withdrawals
              </button>
            </nav>
          </div>

          <!-- Transactions Tab -->
          <div id="transactions-tab" class="tab-content p-6">
            <div class="mb-6">
              <h3 class="text-lg font-semibold text-starlight mb-4">Transaction History</h3>
              
              <!-- Transaction Type Filters -->
              <div class="mb-4">
                <h4 class="text-sm font-medium text-starlight-muted mb-2">Filter by Type</h4>
                <div class="flex flex-wrap gap-2">
                  <button class="transaction-type-filter active" data-type="">
                    <i class="fas fa-list mr-2"></i>All Types
                  </button>
                  <button class="transaction-type-filter" data-type="tournament_payout">
                    <i class="fas fa-trophy mr-2"></i>Tournament Payout
                  </button>
                  <button class="transaction-type-filter" data-type="withdrawal">
                    <i class="fas fa-arrow-down mr-2"></i>Withdrawal
                  </button>
                  <button class="transaction-type-filter" data-type="refund">
                    <i class="fas fa-undo mr-2"></i>Refund
                  </button>
                </div>
              </div>

              <!-- Transaction Status Filters -->
              <div class="mb-4">
                <h4 class="text-sm font-medium text-starlight-muted mb-2">Filter by Status</h4>
                <div class="flex flex-wrap gap-2">
                  <button class="transaction-status-filter active" data-status="">
                    <i class="fas fa-circle mr-2"></i>All Status
                  </button>
                  <button class="transaction-status-filter" data-status="completed">
                    <i class="fas fa-check-circle mr-2"></i>Completed
                  </button>
                  <button class="transaction-status-filter" data-status="pending">
                    <i class="fas fa-clock mr-2"></i>Pending
                  </button>
                  <button class="transaction-status-filter" data-status="failed">
                    <i class="fas fa-times-circle mr-2"></i>Failed
                  </button>
                </div>
              </div>
            </div>
            
            <div id="transactions-list">
              ${this.renderTransactionsList()}
            </div>
          </div>

          <!-- Withdrawals Tab -->
          <div id="withdrawals-tab" class="tab-content p-6 hidden">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-starlight">Withdrawal Requests</h3>
            </div>
            
            <div id="withdrawals-list">
              ${this.renderWithdrawalsList()}
            </div>
          </div>
        </div>
      </div>

      <!-- Withdrawal Modal -->
      ${this.renderWithdrawalModal()}
    `;
  }

  /**
   * Render balance card
   */
  renderBalanceCard(title, amount, icon, color, showWithdrawBtn = false) {
    const formattedAmount = typeof amount === 'number' ? 
      `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 
      `₹${amount}`;

    return `
      <div class="glass rounded-xl p-6 hover:cyber-glow transition-all duration-300">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-starlight-muted text-sm font-medium">${title}</p>
            <p class="text-2xl font-bold text-starlight mt-1">${formattedAmount}</p>
            ${showWithdrawBtn && amount > 0 ? `
              <button class="mt-2 text-xs text-cyber-cyan hover:text-cyber-cyan/80 font-medium" onclick="document.getElementById('withdraw-btn').click()">
                Withdraw Now
              </button>
            ` : ''}
          </div>
          <div class="w-12 h-12 bg-${color}/20 rounded-full flex items-center justify-center">
            <i class="${icon} text-${color} text-xl"></i>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render transactions list
   */
  renderTransactionsList() {
    if (!this.transactions.length) {
      return `
        <div class="text-center py-8">
          <i class="fas fa-receipt text-4xl text-starlight-muted mb-4"></i>
          <p class="text-starlight-muted">No transactions found</p>
        </div>
      `;
    }

    return `
      <div class="space-y-3">
        ${this.transactions.map(transaction => this.renderTransactionItem(transaction)).join('')}
      </div>
    `;
  }

  /**
   * Render single transaction item
   */
  renderTransactionItem(transaction) {
    const isPositive = transaction.amount > 0;
    const statusColor = {
      completed: 'green-400',
      pending: 'yellow-400',
      failed: 'red-400'
    }[transaction.status] || 'gray-400';

    const typeIcon = {
      tournament_payout: 'fas fa-trophy',
      withdrawal: 'fas fa-arrow-down',
      refund: 'fas fa-undo'
    }[transaction.type] || 'fas fa-exchange-alt';

    return `
      <div class="flex items-center justify-between p-4 bg-dark-panel/50 rounded-lg border border-cyber-border/30">
        <div class="flex items-center space-x-4">
          <div class="w-10 h-10 bg-cyber-indigo/20 rounded-full flex items-center justify-center">
            <i class="${typeIcon} text-cyber-indigo"></i>
          </div>
          <div>
            <p class="font-medium text-starlight">${transaction.description}</p>
            <p class="text-sm text-starlight-muted">${this.formatDate(transaction.createdAt)}</p>
          </div>
        </div>
        <div class="text-right">
          <p class="font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}">
            ${isPositive ? '+' : ''}₹${Math.abs(transaction.amount).toLocaleString('en-IN')}
          </p>
          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${statusColor}/20 text-${statusColor}">
            ${transaction.status}
          </span>
        </div>
      </div>
    `;
  }

  /**
   * Render withdrawals list
   */
  renderWithdrawalsList() {
    if (!this.withdrawals.length) {
      return `
        <div class="text-center py-8">
          <i class="fas fa-money-bill-wave text-4xl text-starlight-muted mb-4"></i>
          <p class="text-starlight-muted">No withdrawal requests found</p>
        </div>
      `;
    }

    return `
      <div class="space-y-3">
        ${this.withdrawals.map(withdrawal => this.renderWithdrawalItem(withdrawal)).join('')}
      </div>
    `;
  }

  /**
   * Render single withdrawal item
   */
  renderWithdrawalItem(withdrawal) {
    const statusColor = {
      pending: 'yellow-400',
      processing: 'blue-400',
      completed: 'green-400',
      failed: 'red-400'
    }[withdrawal.status] || 'gray-400';

    return `
      <div class="flex items-center justify-between p-4 bg-dark-panel/50 rounded-lg border border-cyber-border/30">
        <div class="flex items-center space-x-4">
          <div class="w-10 h-10 bg-yellow-400/20 rounded-full flex items-center justify-center">
            <i class="fas fa-money-bill-wave text-yellow-400"></i>
          </div>
          <div>
            <p class="font-medium text-starlight">Withdrawal Request</p>
            <p class="text-sm text-starlight-muted">${withdrawal.paymentMethod} • ${this.formatDate(withdrawal.requestedAt)}</p>
          </div>
        </div>
        <div class="text-right">
          <p class="font-semibold text-starlight">₹${withdrawal.amount.toLocaleString('en-IN')}</p>
          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${statusColor}/20 text-${statusColor}">
            ${withdrawal.status}
          </span>
        </div>
      </div>
    `;
  }

  /**
   * Render withdrawal modal
   */
  renderWithdrawalModal() {
    return `
      <div id="withdrawal-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
        <div class="glass rounded-xl max-w-md w-full p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-semibold text-starlight">Request Withdrawal</h3>
            <button id="close-withdrawal-modal" class="text-starlight-muted hover:text-starlight">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <form id="withdrawal-form" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-starlight mb-2">Amount</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-starlight-muted">₹</span>
                <input type="number" id="withdrawal-amount" min="100" max="100000" step="0.01" 
                       class="w-full pl-8 pr-4 py-3 bg-dark-panel border border-cyber-border rounded-lg text-starlight focus:border-cyber-cyan focus:outline-none"
                       placeholder="Enter amount">
              </div>
              <p class="text-xs text-starlight-muted mt-1">Minimum: ₹100 | Maximum: ₹1,00,000</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-starlight mb-2">Payment Method</label>
              <select id="payment-method" class="w-full px-4 py-3 bg-dark-panel border border-cyber-border rounded-lg text-starlight focus:border-cyber-cyan focus:outline-none">
                <option value="">Select payment method</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="upi">UPI</option>
              </select>
            </div>

            <div id="bank-details" class="hidden space-y-3">
              <input type="text" id="account-number" placeholder="Account Number" 
                     class="w-full px-4 py-3 bg-dark-panel border border-cyber-border rounded-lg text-starlight focus:border-cyber-cyan focus:outline-none">
              <input type="text" id="ifsc-code" placeholder="IFSC Code" 
                     class="w-full px-4 py-3 bg-dark-panel border border-cyber-border rounded-lg text-starlight focus:border-cyber-cyan focus:outline-none">
              <input type="text" id="account-holder" placeholder="Account Holder Name" 
                     class="w-full px-4 py-3 bg-dark-panel border border-cyber-border rounded-lg text-starlight focus:border-cyber-cyan focus:outline-none">
            </div>

            <div id="upi-details" class="hidden">
              <input type="text" id="upi-id" placeholder="UPI ID (e.g., user@paytm)" 
                     class="w-full px-4 py-3 bg-dark-panel border border-cyber-border rounded-lg text-starlight focus:border-cyber-cyan focus:outline-none">
            </div>

            <div class="flex space-x-3 pt-4">
              <button type="button" id="cancel-withdrawal" class="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                Cancel
              </button>
              <button type="submit" class="flex-1 px-4 py-3 bg-cyber-cyan text-dark-matter rounded-lg hover:bg-cyber-cyan/90 transition-colors font-semibold">
                Request Withdrawal
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Tab switching
    document.querySelectorAll('.wallet-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        this.switchTab(tabName);
      });
    });

    // Withdrawal button
    document.getElementById('withdraw-btn')?.addEventListener('click', () => {
      this.showWithdrawalModal();
    });

    // Refresh wallet
    document.getElementById('refresh-wallet')?.addEventListener('click', () => {
      this.refreshWallet();
    });

    // Withdrawal modal events
    document.getElementById('close-withdrawal-modal')?.addEventListener('click', () => {
      this.hideWithdrawalModal();
    });

    document.getElementById('cancel-withdrawal')?.addEventListener('click', () => {
      this.hideWithdrawalModal();
    });

    // Payment method change
    document.getElementById('payment-method')?.addEventListener('change', (e) => {
      this.togglePaymentDetails(e.target.value);
    });

    // Withdrawal form submission
    document.getElementById('withdrawal-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitWithdrawal();
    });

    // Transaction type filter buttons
    document.querySelectorAll('.transaction-type-filter').forEach(button => {
      button.addEventListener('click', (e) => {
        const type = e.currentTarget.dataset.type;
        this.setTransactionTypeFilter(type);
      });
    });

    // Transaction status filter buttons
    document.querySelectorAll('.transaction-status-filter').forEach(button => {
      button.addEventListener('click', (e) => {
        const status = e.currentTarget.dataset.status;
        this.setTransactionStatusFilter(status);
      });
    });
  }

  /**
   * Switch between tabs
   */
  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.wallet-tab').forEach(tab => {
      tab.classList.remove('active', 'border-cyber-cyan', 'text-cyber-cyan');
      tab.classList.add('border-transparent', 'text-starlight-muted');
    });

    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active', 'border-cyber-cyan', 'text-cyber-cyan');
    document.querySelector(`[data-tab="${tabName}"]`).classList.remove('border-transparent', 'text-starlight-muted');

    // Show/hide tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.add('hidden');
    });

    document.getElementById(`${tabName}-tab`).classList.remove('hidden');
  }

  /**
   * Show withdrawal modal
   */
  showWithdrawalModal() {
    document.getElementById('withdrawal-modal').classList.remove('hidden');
  }

  /**
   * Hide withdrawal modal
   */
  hideWithdrawalModal() {
    document.getElementById('withdrawal-modal').classList.add('hidden');
    document.getElementById('withdrawal-form').reset();
    this.togglePaymentDetails('');
  }

  /**
   * Toggle payment method details
   */
  togglePaymentDetails(method) {
    const bankDetails = document.getElementById('bank-details');
    const upiDetails = document.getElementById('upi-details');

    bankDetails.classList.add('hidden');
    upiDetails.classList.add('hidden');

    if (method === 'bank_transfer') {
      bankDetails.classList.remove('hidden');
    } else if (method === 'upi') {
      upiDetails.classList.remove('hidden');
    }
  }

  /**
   * Submit withdrawal request
   */
  async submitWithdrawal() {
    try {
      const amount = parseFloat(document.getElementById('withdrawal-amount').value);
      const paymentMethod = document.getElementById('payment-method').value;

      if (!amount || amount < 100 || amount > 100000) {
        throw new Error('Please enter a valid amount between ₹100 and ₹1,00,000');
      }

      if (!paymentMethod) {
        throw new Error('Please select a payment method');
      }

      const withdrawalData = {
        amount,
        paymentMethod
      };

      if (paymentMethod === 'bank_transfer') {
        withdrawalData.bankDetails = {
          accountNumber: document.getElementById('account-number').value,
          ifscCode: document.getElementById('ifsc-code').value,
          accountHolder: document.getElementById('account-holder').value
        };

        if (!withdrawalData.bankDetails.accountNumber || !withdrawalData.bankDetails.ifscCode || !withdrawalData.bankDetails.accountHolder) {
          throw new Error('Please fill all bank details');
        }
      } else if (paymentMethod === 'upi') {
        withdrawalData.upiId = document.getElementById('upi-id').value;
        if (!withdrawalData.upiId) {
          throw new Error('Please enter UPI ID');
        }
      }

      const response = await window.apiClient.requestWithdrawal(withdrawalData);

      if (response.success) {
        this.hideWithdrawalModal();
        this.showSuccessMessage('Withdrawal request submitted successfully!');
        await this.refreshWallet();
      } else {
        throw new Error(response.message || 'Failed to submit withdrawal request');
      }

    } catch (error) {
      this.showErrorMessage(error.message);
    }
  }

  /**
   * Refresh wallet data
   */
  async refreshWallet() {
    try {
      await this.loadWalletData();
      await this.loadTransactions();
      await this.loadWithdrawals();
      
      // Update balance cards
      const balanceCards = document.querySelectorAll('.glass');
      balanceCards.forEach(card => {
        card.classList.add('animate-pulse');
        setTimeout(() => card.classList.remove('animate-pulse'), 1000);
      });
      
      // Re-render the interface
      this.render();
      this.bindEvents();
      
    } catch (error) {
      console.error('Failed to refresh wallet:', error);
      this.showErrorMessage('Failed to refresh wallet data');
    }
  }

  /**
   * Format date for display
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Show success message
   */
  showSuccessMessage(message) {
    // Create and show success toast
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  /**
   * Show error message
   */
  showErrorMessage(message) {
    // Create and show error toast
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  /**
   * Render error state
   */
  renderError() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
      <div class="text-center py-20">
        <i class="fas fa-exclamation-triangle text-6xl text-red-400 mb-4"></i>
        <h2 class="text-2xl font-bold mb-2 text-starlight">Failed to Load Wallet</h2>
        <p class="text-starlight-muted mb-4">There was an error loading your wallet information.</p>
        <button onclick="window.walletManagement.init()" class="btn-primary">
          Try Again
        </button>
      </div>
    `;
  }

  /**
   * Set transaction type filter
   */
  setTransactionTypeFilter(type) {
    // Update filter state
    this.transactionFilters.type = type;
    
    // Update button states
    document.querySelectorAll('.transaction-type-filter').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-type="${type}"]`).classList.add('active');
    
    // Reload transactions
    this.loadTransactions().then(() => {
      document.getElementById('transactions-list').innerHTML = this.renderTransactionsList();
    });
  }

  /**
   * Set transaction status filter
   */
  setTransactionStatusFilter(status) {
    // Update filter state
    this.transactionFilters.status = status;
    
    // Update button states
    document.querySelectorAll('.transaction-status-filter').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-status="${status}"]`).classList.add('active');
    
    // Reload transactions
    this.loadTransactions().then(() => {
      document.getElementById('transactions-list').innerHTML = this.renderTransactionsList();
    });
  }

  /**
   * Cleanup method
   */
  destroy() {
    // Remove event listeners and clean up
    this.walletData = null;
    this.transactions = [];
    this.withdrawals = [];
  }
}