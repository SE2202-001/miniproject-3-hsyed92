document.addEventListener('DOMContentLoaded', () => {
    // Query selectors
    const jobsList = document.getElementById('job-list');
    const jobDetailsSection = document.getElementById('job-details-section');
    const jobDetails = document.getElementById('job-details');
    const backToListButton = document.getElementById('back-to-list');
    const filterLevel = document.getElementById('filter-level');
    const filterType = document.getElementById('filter-type');
    const filterSkill = document.getElementById('filter-skill');
    const sortOptions = document.getElementById('sort-options');
    const applyFiltersButton = document.getElementById('apply-filters');
    const sortJobsButton = document.getElementById('sort-jobs');

    let jobs = []; //empty jobs array

    // fetch from json
    async function fetchJobs() {
        try {
            const response = await fetch('./upwork_jobs.json'); 
            //error handling
            if (!response.ok) {
                throw new Error(`Error fetching jobs: ${response.statusText}`);
            }
            jobs = await response.json(); // Parse the json
            populateDropdowns();
            renderJobList(jobs); 
        } catch (error) {
            console.error(error);
            jobsList.innerHTML = "<p>Failed to load job data.</p>";
        }
    }

    //getting gilter options from jobs in json file
    function populateDropdowns() {
        populateDropdown(filterLevel, Array.from(new Set(jobs.map(job => job.Level))));
        populateDropdown(filterType, Array.from(new Set(jobs.map(job => job.Type))));
        populateDropdown(filterSkill, Array.from(new Set(jobs.map(job => job.Skill))));
    }

    function populateDropdown(dropdown, options) {
        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option;
            dropdown.appendChild(opt);
        });
    }

    // showing jobs from json
    function renderJobList(jobsToDisplay) {
        jobsList.innerHTML = "";
        if (jobsToDisplay.length === 0) {
            jobsList.innerHTML = "<p>No jobs found.</p>";
            return;
        }
        jobsToDisplay.forEach(job => {
            const jobItem = document.createElement('div');
            jobItem.className = 'job-item';
            jobItem.innerHTML = `
                <span>${job.Title} - ${job.Type} project (${job.Level})</span>
                <button class="view-details" data-id="${job["Job No"]}">View Details</button>
            `;
            jobsList.appendChild(jobItem);
        });
    }

   //display job list
    function showJobDetails(jobId) {
        const job = jobs.find(j => j["Job No"] === jobId);
        if (job) {
            jobDetails.innerHTML = `
                <h3>${job.Title}</h3>
                <p><strong>Posted:</strong> ${job.Posted}</p>
                <p><strong>Type:</strong> ${job.Type}</p>
                <p><strong>Level:</strong> ${job.Level}</p>
                <p><strong>Estimated Time:</strong> ${job["Estimated Time"]}</p>
                <p><strong>Skill:</strong> ${job.Skill}</p>
                <p><strong>Detail:</strong> ${job.Detail}</p>
                <a href="${job["Job Page Link"]}" target="_blank">View Job on Upwork</a>
            `;
            jobDetailsSection.hidden = false;
            jobsList.parentElement.hidden = true; // hide job list
        }
    }

    // filters
    function applyFilters() {
        const selectedLevel = filterLevel.value;
        const selectedType = filterType.value;
        const selectedSkill = filterSkill.value;

        const filteredJobs = jobs.filter(job => {
            return (
                (selectedLevel === "All" || job.Level === selectedLevel) &&
                (selectedType === "All" || job.Type === selectedType) &&
                (selectedSkill === "All" || job.Skill === selectedSkill)
            );
        });
        renderJobList(filteredJobs);
    }

    // Sort
    function sortJobs(criteria) {
        let sortedJobs = [...jobs];
        if (criteria === "title") {
            sortedJobs.sort((a, b) => a.Title.localeCompare(b.Title));
        } else if (criteria === "level") {
            sortedJobs.sort((a, b) => a.Level.localeCompare(b.Level));
        } else if (criteria === "posted") {
            // Sort by posted time (e.g., "8 minutes ago")
            sortedJobs.sort((a, b) => extractMinutes(a.Posted) - extractMinutes(b.Posted));
        }
        renderJobList(sortedJobs);
    }

    // time finder
    function extractMinutes(postedTime) {
        const match = postedTime.match(/(\d+)\s*minutes\s*ago/);
        return match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
    }

    // event Listeners
    jobsList.addEventListener('click', (event) => {
        if (event.target.classList.contains('view-details')) {
            const jobId = event.target.dataset.id;
            showJobDetails(jobId);
        }
    });

    backToListButton.addEventListener('click', () => {
        jobDetailsSection.hidden = true;
        jobsList.parentElement.hidden = false;
    });

    applyFiltersButton.addEventListener('click', applyFilters);

    sortJobsButton.addEventListener('click', () => {
        const selectedSortOption = sortOptions.value;
        if (selectedSortOption) {
            sortJobs(selectedSortOption);
        }
    });

    // Fetch and render jobs on page load
    fetchJobs();
});
