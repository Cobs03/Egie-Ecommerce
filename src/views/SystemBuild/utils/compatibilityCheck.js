// Create this new file

export const checkCompatibility = (selectedProducts) => {
  const issues = [];
  
  const cpu = selectedProducts['CPU'];
  const motherboard = selectedProducts['Motherboard'];
  const ram = selectedProducts['RAM'];
  const gpu = selectedProducts['GPU'];
  const psu = selectedProducts['PSU'];
  const pcCase = selectedProducts['Case'];
  const cpuCooler = selectedProducts['CPU Cooler'];

  // 1. CPU + Motherboard Socket Check
  if (cpu && motherboard) {
    if (cpu.socket && motherboard.socket && cpu.socket !== motherboard.socket) {
      issues.push({
        type: 'error',
        message: `CPU socket (${cpu.socket}) doesn't match Motherboard socket (${motherboard.socket})`
      });
    }
  }

  // 2. RAM + Motherboard DDR Check
  if (ram && motherboard) {
    if (ram.memoryType && motherboard.memoryType && ram.memoryType !== motherboard.memoryType) {
      issues.push({
        type: 'error',
        message: `RAM type (${ram.memoryType}) incompatible with Motherboard (${motherboard.memoryType})`
      });
    }
  }

  // 3. Motherboard + Case Form Factor Check
  if (motherboard && pcCase) {
    const mbFormFactor = (motherboard.formFactor || motherboard.form_factor || '').toLowerCase();
    const caseFormFactor = (pcCase.formFactor || pcCase.form_factor || '').toLowerCase();
    
    // Case compatibility matrix
    const compatibilityMatrix = {
      'mini-itx': ['mini-itx', 'micro-atx', 'atx', 'mid-tower', 'full-tower'],
      'micro-atx': ['micro-atx', 'atx', 'mid-tower', 'full-tower'],
      'atx': ['atx', 'mid-tower', 'full-tower'],
      'e-atx': ['full-tower', 'e-atx']
    };
    
    if (mbFormFactor && caseFormFactor) {
      const compatibleCases = compatibilityMatrix[mbFormFactor] || [];
      const isCompatible = compatibleCases.some(c => caseFormFactor.includes(c));
      
      if (!isCompatible) {
        issues.push({
          type: 'error',
          message: `Motherboard form factor (${mbFormFactor.toUpperCase()}) may not fit in ${caseFormFactor.toUpperCase()} case`
        });
      }
    }
  }

  // 4. GPU + Case Size Check
  if (gpu && pcCase) {
    if (gpu.length && pcCase.maxGpuLength && gpu.length > pcCase.maxGpuLength) {
      issues.push({
        type: 'error',
        message: `GPU too long (${gpu.length}mm) for case (max ${pcCase.maxGpuLength}mm)`
      });
    }
  }

  // 5. PSU Wattage Check
  if (psu) {
    const estimatedWattage = calculateEstimatedWattage(selectedProducts);
    const psuWattage = psu.wattage || 0;
    
    if (psuWattage < estimatedWattage) {
      issues.push({
        type: 'error',
        message: `PSU (${psuWattage}W) may be insufficient. Estimated need: ${estimatedWattage}W`
      });
    } else if (psuWattage < estimatedWattage * 1.2) {
      issues.push({
        type: 'warning',
        message: `PSU has low headroom. Recommended: ${Math.ceil(estimatedWattage * 1.2)}W`
      });
    }
  }

  // 6. CPU Cooler + Case Height Check
  if (cpuCooler && pcCase) {
    if (cpuCooler.height && pcCase.maxCoolerHeight && cpuCooler.height > pcCase.maxCoolerHeight) {
      issues.push({
        type: 'error',
        message: `CPU Cooler too tall (${cpuCooler.height}mm) for case (max ${pcCase.maxCoolerHeight}mm)`
      });
    }
  }

  return issues;
};

// 9. Wattage Calculator
export const calculateEstimatedWattage = (selectedProducts) => {
  let totalWattage = 0;
  
  // Base system power (motherboard, fans, etc.)
  totalWattage += 50;
  
  // CPU TDP
  if (selectedProducts['CPU']?.tdp) {
    totalWattage += selectedProducts['CPU'].tdp;
  }
  
  // GPU TDP
  if (selectedProducts['GPU']?.tdp) {
    totalWattage += selectedProducts['GPU'].tdp;
  }
  
  // RAM (roughly 5W per stick)
  if (selectedProducts['RAM']) {
    totalWattage += 10;
  }
  
  // Storage
  if (selectedProducts['SSD']) {
    totalWattage += 5;
  }
  if (selectedProducts['HDD']) {
    totalWattage += 10;
  }
  
  // Add 20% headroom
  return Math.ceil(totalWattage * 1.2);
};

/**
 * Get compatibility level for a specific product when added to existing build
 * Returns: { level: 'perfect' | 'good' | 'warning' | 'incompatible', issues: [] }
 */
export const getCompatibilityLevel = (componentType, product, selectedProducts) => {
  const testBuild = { ...selectedProducts, [componentType]: product };
  const issues = checkCompatibility(testBuild);
  
  // Filter issues relevant to this product
  const relevantIssues = issues.filter(issue => {
    const msg = issue.message.toLowerCase();
    const productName = product.name.toLowerCase();
    const typeName = componentType.toLowerCase();
    return msg.includes(typeName) || msg.includes(productName);
  });
  
  // Determine compatibility level
  if (relevantIssues.length === 0) {
    return { level: 'perfect', issues: [], message: 'Fully compatible' };
  }
  
  const hasError = relevantIssues.some(i => i.type === 'error');
  const hasWarning = relevantIssues.some(i => i.type === 'warning');
  
  if (hasError) {
    return { 
      level: 'incompatible', 
      issues: relevantIssues,
      message: 'Not compatible'
    };
  }
  
  if (hasWarning) {
    return { 
      level: 'warning', 
      issues: relevantIssues,
      message: 'Potential issues'
    };
  }
  
  return { level: 'good', issues: [], message: 'Compatible' };
};